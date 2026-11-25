// Vercel Serverless Function: Envío automatizado de correos con enlaces de moldería PDF y tutoriales de YouTube
// Utiliza Gmail SMTP directo (Nodemailer) con credenciales de aplicación de Google

const IP_RATE_LIMIT = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 10; // Máximo 10 emails por IP por minuto

function verificarRateLimit(ip) {
  if (!ip || ip === "ip-desconocida") return true;
  const ahora = Date.now();
  const registro = IP_RATE_LIMIT.get(ip) || [];
  const recientes = registro.filter(t => ahora - t < RATE_LIMIT_WINDOW_MS);
  if (recientes.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  recientes.push(ahora);
  IP_RATE_LIMIT.set(ip, recientes);
  return true;
}

let nodemailer = null;
try {
  nodemailer = require("nodemailer");
} catch (e) {
  // En entornos locales sin npm install previo, nodemailer se cargará dinámicamente o se simula el envío
}

function escaparHtmlEmail(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function urlSegura(url) {
  if (!url || typeof url !== "string") return "";
  const trim = url.trim();
  if (trim.startsWith("https://") || trim.startsWith("http://")) {
    return trim;
  }
  return "";
}

/**
 * Genera una URL firmada temporal en Supabase Storage para archivos del bucket privado 'moldes-archivos'.
 * Requiere SUPABASE_SERVICE_ROLE_KEY para firmar en el servidor de forma segura.
 */
async function firmarRutaStorage(supabaseUrl, supabaseKey, rutaOUrl, segundosValidez = 604800) {
  if (!rutaOUrl || typeof rutaOUrl !== "string") return "";
  const limpia = rutaOUrl.trim();
  if (!limpia || limpia.startsWith("data:") || limpia.startsWith("blob:")) return "";

  // Si ya es una URL firmada válida o un enlace externo ajeno a nuestro bucket, devolver tal cual
  if (limpia.startsWith("http://") || limpia.startsWith("https://")) {
    if (!limpia.includes("/moldes-archivos/") || limpia.includes("token=")) {
      return limpia;
    }
  }

  if (!supabaseUrl || !supabaseKey) return urlSegura(limpia);

  try {
    let ruta = limpia.split("?")[0].trim();
    if (ruta.includes("/moldes-archivos/")) {
      ruta = ruta.split("/moldes-archivos/").pop();
    }
    ruta = ruta.replace(/^moldes-archivos\//, "").replace(/^\/+/, "");
    if (!ruta) return "";

    const baseUrl = supabaseUrl.replace(/\/+$/, "");
    const rutaCodificada = ruta.split("/").map(seg => encodeURIComponent(seg)).join("/");

    const signRes = await fetch(`${baseUrl}/storage/v1/object/sign/moldes-archivos/${rutaCodificada}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ expiresIn: segundosValidez })
    });

    if (!signRes.ok) {
      console.warn(`[Envio Email] No se pudo firmar ruta '${ruta}' en Storage (HTTP ${signRes.status})`);
      return urlSegura(limpia);
    }

    const signData = await signRes.json();
    let urlFinal = signData.signedURL || signData.signedUrl || "";
    if (!urlFinal) return urlSegura(limpia);

    if (urlFinal.startsWith("/")) {
      urlFinal = urlFinal.startsWith("/storage/v1")
        ? `${baseUrl}${urlFinal}`
        : `${baseUrl}/storage/v1${urlFinal}`;
    }

    if (!urlFinal.includes("download=")) {
      urlFinal += (urlFinal.includes("?") ? "&" : "?") + "download=";
    }

    return urlFinal;
  } catch (err) {
    console.warn("[Envio Email] Excepción firmando ruta Storage:", err.message);
    return urlSegura(limpia);
  }
}

/**
 * Desempaqueta link_archivos cuando viene serializado como JSON { molde, specs }
 */
function extraerRutasDeLinkArchivos(linkArchivos) {
  if (!linkArchivos || typeof linkArchivos !== "string") return { molde: "", specs: "" };
  const trim = linkArchivos.trim();
  if (trim.startsWith("{")) {
    try {
      const parsed = JSON.parse(trim);
      return {
        molde: parsed.molde || parsed.archivoUrl || "",
        specs: parsed.specs || parsed.archivoSpecsUrl || ""
      };
    } catch (e) {}
  }
  return { molde: trim, specs: "" };
}

/**
 * Completa los ítems del pedido consultando Supabase (pedido_items y productos)
 * y firma en el servidor cualquier ruta privada del bucket 'moldes-archivos'.
 */
async function enriquecerItemsDesdeSupabase(supabaseUrl, supabaseKey, codigoPedido, itemsEntrada = []) {
  let itemsBase = Array.isArray(itemsEntrada) ? [...itemsEntrada] : [];

  if (supabaseUrl && supabaseKey) {
    const baseUrl = supabaseUrl.replace(/\/+$/, "");

    // 1. Si no recibimos ítems o les faltan IDs, consultar pedido_items en Supabase
    if (itemsBase.length === 0 && codigoPedido && !String(codigoPedido).startsWith("ENV-MANUAL-")) {
      try {
        const resPed = await fetch(
          `${baseUrl}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(codigoPedido)}&select=id,pedido_items(producto_id,nombre,precio,cantidad,archivo_url,archivo_specs_url,link_archivos,link_video)`,
          {
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`
            }
          }
        );
        if (resPed.ok) {
          const rows = await resPed.json();
          if (rows && rows[0] && Array.isArray(rows[0].pedido_items)) {
            itemsBase = rows[0].pedido_items;
          }
        }
      } catch (e) {
        console.warn("[Envio Email] No se pudieron leer pedido_items desde Supabase:", e.message);
      }
    }

    // 2. Consultar tabla productos oficial para asegurar rutas privadas reales y actualizadas
    const idsProductos = [...new Set(
      itemsBase
        .map(it => Number(it.producto_id || it.id))
        .filter(id => !isNaN(id) && id > 0)
    )];

    const mapaProductos = new Map();
    if (idsProductos.length > 0) {
      try {
        const resProds = await fetch(
          `${baseUrl}/rest/v1/productos?id=in.(${idsProductos.join(",")})&select=id,nombre,archivo_url,archivo_specs_url,link_archivos,link_video`,
          {
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`
            }
          }
        );
        if (resProds.ok) {
          const prods = await resProds.json();
          (prods || []).forEach(p => mapaProductos.set(Number(p.id), p));
        }
      } catch (e) {
        console.warn("[Envio Email] No se pudieron consultar productos oficiales:", e.message);
      }
    }

    // 3. Resolver y firmar enlaces de cada ítem
    const itemsResueltos = [];
    for (const item of itemsBase) {
      const prodId = Number(item.producto_id || item.id);
      const prodDb = mapaProductos.get(prodId) || {};

      const extraItem = extraerRutasDeLinkArchivos(item.link_archivos || item.linkArchivos || "");
      const extraProd = extraerRutasDeLinkArchivos(prodDb.link_archivos || "");

      const linkYaFirmado = urlSegura(item.linkDescarga) && item.linkDescarga.includes("token=")
        ? item.linkDescarga
        : "";
      const specsYaFirmado = urlSegura(item.linkSpecs) && item.linkSpecs.includes("token=")
        ? item.linkSpecs
        : "";

      const rutaMolde =
        linkYaFirmado ||
        prodDb.archivo_url ||
        extraProd.molde ||
        item.archivo_url ||
        item.archivoUrl ||
        extraItem.molde ||
        item.linkDescarga ||
        "";

      const rutaSpecs =
        specsYaFirmado ||
        prodDb.archivo_specs_url ||
        extraProd.specs ||
        item.archivo_specs_url ||
        item.archivoSpecsUrl ||
        extraItem.specs ||
        item.linkSpecs ||
        "";

      const linkVideo =
        prodDb.link_video ||
        item.link_video ||
        item.linkVideo ||
        "";

      const linkDescargaFinal = await firmarRutaStorage(baseUrl, supabaseKey, rutaMolde, 86400 * 7);
      const linkSpecsFinal = await firmarRutaStorage(baseUrl, supabaseKey, rutaSpecs, 86400 * 7);

      itemsResueltos.push({
        id: prodId || item.id,
        nombre: item.nombre || prodDb.nombre || "Molde Digital",
        linkDescarga: linkDescargaFinal || urlSegura(rutaMolde),
        linkSpecs: linkSpecsFinal || urlSegura(rutaSpecs),
        linkVideo: urlSegura(linkVideo),
        precio: Number(item.precio || 0),
        cantidad: Number(item.cantidad || 1)
      });
    }

    return itemsResueltos;
  }

  return itemsBase;
}

/**
 * Verifica mediante Supabase Auth + tabla administradores que un token pertenezca a un admin aprobado
 */
async function verificarAdminJwt(supabaseUrl, supabaseKey, authHeader) {
  if (!supabaseUrl || !supabaseKey || !authHeader || typeof authHeader !== "string") return false;
  if (!authHeader.startsWith("Bearer ")) return false;

  const baseUrl = supabaseUrl.replace(/\/+$/, "");
  try {
    const userRes = await fetch(`${baseUrl}/auth/v1/user`, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": authHeader
      }
    });
    if (!userRes.ok) return false;
    const user = await userRes.json();
    if (!user || !user.email) return false;

    const adminRes = await fetch(
      `${baseUrl}/rest/v1/administradores?aprobado=eq.true&email=eq.${encodeURIComponent(user.email.toLowerCase())}&select=id,email`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`
        }
      }
    );
    if (!adminRes.ok) return false;
    const admins = await adminRes.json();
    return Array.isArray(admins) && admins.length > 0;
  } catch (e) {
    console.warn("[Envio Email] Error verificando sesión admin:", e.message);
    return false;
  }
}

function generarHtmlCorreo({ cliente, codigoPedido, items, metodoPago, total, urlTienda }) {
  const nombreCliente = (cliente && cliente.nombre) ? cliente.nombre.trim() : "Cliente";
  const esEnvioManual = metodoPago === "manual" || String(codigoPedido || "").startsWith("ENV-MANUAL-");

  const listaItemsHtml = (items || []).map(item => {
    const nombre = item.nombre || "Molde Digital";
    const linkDescarga = urlSegura(item.linkDescarga || item.linkArchivos || item.archivoUrl || "");
    const linkSpecs = urlSegura(item.linkSpecs || item.archivoSpecsUrl || item.archivo_specs_url || "");
    const linkVideo = urlSegura(item.linkVideo || "");

    return `
      <div style="background-color: #faf7fd; border: 1px solid #ebdcfc; border-radius: 10px; padding: 18px 20px; margin-bottom: 16px;">
        <h3 style="margin: 0 0 10px 0; color: #583387; font-size: 17px; font-weight: 700;">
          ✂️ ${escaparHtmlEmail(nombre)}
        </h3>
        <p style="margin: 0 0 14px 0; color: #555555; font-size: 14px; line-height: 1.5;">
          Molde digital descargable listo para imprimir en hojas A4 y tamaño real.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
          ${linkDescarga ? `
            <a href="${escaparHtmlEmail(linkDescarga)}" target="_blank" rel="noopener noreferrer"
               style="display: inline-block; background-color: #845ec2; color: #ffffff; text-decoration: none; padding: 11px 20px; border-radius: 7px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(132, 94, 194, 0.25);">
              📥 Descargar Molde
            </a>
          ` : `
            <span style="display: inline-block; background-color: #eee; color: #777; padding: 8px 14px; border-radius: 6px; font-size: 13px;">
              Archivo en preparación
            </span>
          `}

          ${linkSpecs ? `
            <a href="${escaparHtmlEmail(linkSpecs)}" target="_blank" rel="noopener noreferrer"
               style="display: inline-block; background-color: #583387; color: #ffffff; text-decoration: none; padding: 11px 20px; border-radius: 7px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(88, 51, 135, 0.25);">
              📋 Especificaciones y Materiales
            </a>
          ` : ''}

          ${linkVideo ? `
            <a href="${escaparHtmlEmail(linkVideo)}" target="_blank" rel="noopener noreferrer"
               style="display: inline-block; background-color: #ffffff; color: #dc2626; border: 1.5px solid #fca5a5; text-decoration: none; padding: 9px 18px; border-radius: 7px; font-weight: 600; font-size: 14px;">
              ▶️ Ver Tutorial en YouTube
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }).join("");

  const baseTienda = (urlTienda || "https://cosecongiu.vercel.app").replace(/\/+$/, "");
  const urlRastreo = `${baseTienda}?descarga=${encodeURIComponent(codigoPedido)}&email=${encodeURIComponent((cliente && cliente.email) || "")}`;

  let textoIntro = "¡Muchas gracias por tu compra! Tu pago ha sido confirmado y tus archivos digitales ya están disponibles para su descarga inmediata:";
  if (metodoPago === "gratuito") {
    textoIntro = "¡Muchas gracias por sumarte a la comunidad! Aquí tenés tu molde gratuito para descargar y empezar a coser cuando quieras:";
  } else if (esEnvioManual) {
    textoIntro = "Desde el equipo de Cosé con Giu te enviamos los enlaces de descarga directa de tu moldería digital y sus tutoriales:";
  }

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Tus Moldes de Cosé con Giu</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4ecfd; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #251b33;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4ecfd; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(132, 94, 194, 0.12); max-width: 600px;">
              
              <!-- ENCABEZADO BOUTIQUE -->
              <tr>
                <td style="background: linear-gradient(135deg, #845ec2 0%, #583387 100%); padding: 30px 30px 25px 30px; text-align: center; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                    Cosé con Giu
                  </h1>
                  <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; color: #f4ecfd;">
                    Moldes Digitales & Costura Fácil
                  </p>
                </td>
              </tr>

              <!-- CONTENIDO PRINCIPAL -->
              <tr>
                <td style="padding: 30px 30px 20px 30px;">
                  <div style="display: inline-block; background-color: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-bottom: 12px;">
                    ✓ Acceso Habilitado
                  </div>

                  <h2 style="margin: 0 0 10px 0; color: #251b33; font-size: 21px; font-weight: 700;">
                    ¡Hola, ${escaparHtmlEmail(nombreCliente)}!
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 15px; line-height: 1.6;">
                    ${textoIntro}
                  </p>

                  ${!esEnvioManual && codigoPedido ? `
                  <div style="background-color: #fbf9fe; border-left: 4px solid #845ec2; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                    <div style="font-size: 13px; color: #777777;">Código de Pedido:</div>
                    <div style="font-size: 16px; font-weight: 700; color: #583387;">${escaparHtmlEmail(codigoPedido)}</div>
                  </div>
                  ` : ''}

                  <!-- LISTADO DE MOLDES Y VIDEOS -->
                  ${listaItemsHtml}

                  ${!esEnvioManual && codigoPedido ? `
                  <!-- CONSULTA EN LA WEB DE POR VIDA -->
                  <div style="margin-top: 25px; padding: 18px; background-color: #fef9e8; border: 1px solid #f6e3a4; border-radius: 8px; text-align: center;">
                    <strong style="color: #b45309; font-size: 14px; display: block; margin-bottom: 6px;">
                      💡 ¿Querés descargar tus moldes más tarde?
                    </strong>
                    <p style="margin: 0 0 12px 0; color: #78350f; font-size: 13px; line-height: 1.45;">
                      Podés volver a descargarlos siempre que quieras desde nuestra tienda con tu código de pedido:
                    </p>
                    <a href="${urlRastreo}" target="_blank" rel="noopener noreferrer"
                       style="display: inline-block; background-color: #c7a138; color: #ffffff; text-decoration: none; padding: 9px 18px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                      Acceder a Mis Descargas en la Web
                    </a>
                  </div>
                  ` : ''}
                </td>
              </tr>

              <!-- PIE DE FIRMA Y REDES -->
              <tr>
                <td style="background-color: #faf7fd; padding: 22px 30px; border-top: 1px solid #ebdcfc; text-align: center; color: #777777; font-size: 13px;">
                  <p style="margin: 0 0 8px 0; font-weight: 600; color: #251b33;">
                    ¿Tenés alguna duda o consulta sobre la confección?
                  </p>
                  <p style="margin: 0 0 12px 0;">
                    Escribinos directo a nuestro WhatsApp: 
                    <a href="https://api.whatsapp.com/send?phone=5493813581558" style="color: #845ec2; font-weight: 600; text-decoration: none;">
                      +54 9 381 358-1558
                    </a>
                  </p>
                  <div style="font-size: 12px; color: #999999;">
                    Cosé con Giu • Moldes Digitales • San Miguel de Tucumán, Argentina
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Función reutilizable en backend para enriquecer los enlaces desde Supabase y enviar el correo SMTP.
 * Utilizada tanto por la ruta HTTP /api/enviar-email como por /api/verificar-pago y /api/webhook-mercadopago.
 */
async function enviarCorreoPedidoServer({
  supabaseUrl,
  supabaseKey,
  codigoPedido,
  cliente,
  items = [],
  metodoPago = "mercadopago",
  total = 0,
  urlTienda = "https://cosecongiu.vercel.app"
}) {
  const destinatario = (cliente && cliente.email) ? cliente.email.trim().toLowerCase() : "";
  if (!destinatario) {
    throw new Error("Falta el correo electrónico del destinatario.");
  }

  const itemsEnriquecidos = await enriquecerItemsDesdeSupabase(supabaseUrl, supabaseKey, codigoPedido, items);

  let asunto = `✂️ Tus Moldes Digitales están listos para descargar - Pedido ${codigoPedido}`;
  if (metodoPago === "gratuito") {
    asunto = `🎁 Tu Molde Gratuito está listo - Cosé con Giu`;
  } else if (metodoPago === "manual" || String(codigoPedido || "").startsWith("ENV-MANUAL-")) {
    asunto = `✂️ Tus Moldes Digitales de Cosé con Giu`;
  }

  const htmlContent = generarHtmlCorreo({
    cliente,
    codigoPedido,
    items: itemsEnriquecidos,
    metodoPago,
    total,
    urlTienda
  });

  const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD || process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass || !nodemailer) {
    console.warn("[Envio Email] GMAIL_USER o GMAIL_APP_PASSWORD no configurados en variables de entorno.");
    return {
      success: true,
      simulado: true,
      mensaje: "Correo registrado (Modo simulación: faltan variables GMAIL_USER o GMAIL_APP_PASSWORD en Vercel)."
    };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  });

  const remitente = `Cosé con Giu <${gmailUser}>`;
  const info = await transporter.sendMail({
    from: remitente,
    to: destinatario,
    subject: asunto,
    html: htmlContent
  });

  console.log(`[Envio Email Exitoso] Pedido: ${codigoPedido} -> ${destinatario} (ID: ${info.messageId})`);

  return {
    success: true,
    simulado: false,
    mensajeId: info.messageId,
    destinatario
  };
}

const handler = async (req, res) => {
  // Cabeceras CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Utiliza POST." });
  }

  // Rate Limiting anti-abuso (máximo 10 correos por IP por minuto)
  const forwarded = req.headers["x-forwarded-for"];
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : (req.socket?.remoteAddress || "ip-desconocida");
  if (!verificarRateLimit(clientIp)) {
    return res.status(429).json({ error: "Demasiadas solicitudes de envío. Por favor espera un momento." });
  }

  try {
    const { codigoPedido, cliente, items, metodoPago, total, urlTienda, modoManualAdmin } = req.body || {};

    if (!cliente || !cliente.email || (!codigoPedido && !modoManualAdmin)) {
      return res.status(400).json({ error: "Datos incompletos: se requiere codigoPedido y cliente.email." });
    }

    const destinatario = cliente.email.trim().toLowerCase();
    const supabaseUrl = process.env.SUPABASE_URL || "https://obvboktbdbahgbvemlid.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    let esAdminVerificado = false;
    if (req.headers.authorization && supabaseUrl && supabaseKey) {
      esAdminVerificado = await verificarAdminJwt(supabaseUrl, supabaseKey, req.headers.authorization);
    }

    if (modoManualAdmin) {
      if (!esAdminVerificado) {
        return res.status(403).json({ error: "Acceso denegado: solo administradores aprobados pueden enviar moldes manualmente." });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Debes seleccionar al menos un molde para enviar." });
      }
    } else if (supabaseUrl && supabaseKey) {
      // Verificación defensiva contra base de datos para prevenir uso indebido como spam relay
      try {
        const baseUrl = supabaseUrl.replace(/\/+$/, "");
        const resPed = await fetch(`${baseUrl}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(codigoPedido)}&select=id,estado,cliente_email,metodo_pago`, {
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`
          }
        });
        if (resPed.ok) {
          const pedidosDb = await resPed.json();
          if (!pedidosDb || pedidosDb.length === 0) {
            console.warn(`[Envio Email] Intento de envío para pedido inexistente: ${codigoPedido}`);
            return res.status(404).json({ error: "El pedido especificado no existe en la base de datos." });
          }
          const p = pedidosDb[0];
          if (!esAdminVerificado && p.cliente_email && p.cliente_email.toLowerCase() !== destinatario) {
            console.warn(`[Envio Email] Discrepancia de correo en pedido ${codigoPedido}: ${p.cliente_email} vs ${destinatario}`);
            return res.status(403).json({ error: "El correo del destinatario no coincide con el registrado en el pedido." });
          }
          if (!esAdminVerificado && p.estado !== "completada" && p.metodo_pago !== "gratuito") {
            console.warn(`[Envio Email] Intento de envío para pedido no completado: ${codigoPedido} (${p.estado})`);
            return res.status(403).json({ error: "El pedido aún no está aprobado para envío de archivos." });
          }
        }
      } catch (errSupabase) {
        console.warn("[Envio Email] No se pudo verificar pedido en Supabase (continuando):", errSupabase.message);
      }
    }

    const codigoFinal = codigoPedido || `ENV-MANUAL-${Date.now().toString(36).toUpperCase()}`;
    const resultado = await enviarCorreoPedidoServer({
      supabaseUrl,
      supabaseKey,
      codigoPedido: codigoFinal,
      cliente,
      items: items || [],
      metodoPago: modoManualAdmin ? (codigoPedido && String(codigoPedido).startsWith("ORD-") ? (metodoPago || "mercadopago") : "manual") : (metodoPago || "mercadopago"),
      total: total || 0,
      urlTienda: urlTienda || (req.headers && req.headers.origin) || "https://cosecongiu.vercel.app"
    });

    return res.status(200).json(resultado);

  } catch (error) {
    console.error("[Envio Email Error]:", error);
    return res.status(500).json({
      error: "Error al enviar el correo electrónico.",
      detalle: error.message
    });
  }
};

/**
 * Marca el pedido aprobado por Mercado Pago como 'completada' en Supabase y envía el email
 * usando un bloqueo atómico (archivos_enviados=false -> true) para evitar duplicados entre Webhook y Retorno.
 */
async function procesarAprobacionMercadoPagoServer({
  supabaseUrl,
  supabaseKey,
  codigoPedido,
  numeroOperacion = null,
  urlTienda = "https://cosecongiu.vercel.app"
}) {
  if (!supabaseUrl || !supabaseKey || !codigoPedido) {
    return { actualizado: false, emailEnviado: false };
  }

  const baseUrl = supabaseUrl.replace(/\/+$/, "");
  let actualizado = false;

  // 1. Marcar como completada vía RPC segura o PATCH directo
  try {
    const rpcRes = await fetch(`${baseUrl}/rest/v1/rpc/marcar_pedido_completado_mp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        p_codigo: String(codigoPedido),
        p_numero_operacion: numeroOperacion ? String(numeroOperacion) : null
      })
    });
    if (rpcRes.ok) {
      actualizado = true;
    }
  } catch (e) {
    console.warn("[MP Sync] Error invocando RPC marcar_pedido_completado_mp:", e.message);
  }

  if (!actualizado) {
    try {
      const patchRes = await fetch(`${baseUrl}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(codigoPedido)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          estado: "completada",
          numero_operacion: numeroOperacion ? String(numeroOperacion) : undefined
        })
      });
      if (patchRes.ok) actualizado = true;
    } catch (e) {
      console.warn("[MP Sync] Error en PATCH directo de pedido:", e.message);
    }
  }

  // 2. Lock atómico para enviar el email de descarga una sola vez
  let emailEnviado = false;
  let yaEnviado = false;
  try {
    const fechaEnvio = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
    const lockRes = await fetch(
      `${baseUrl}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(codigoPedido)}&archivos_enviados=eq.false`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          archivos_enviados: true,
          fecha_envio_archivos: fechaEnvio
        })
      }
    );

    if (lockRes.ok) {
      const lockedRows = await lockRes.json();
      if (Array.isArray(lockedRows) && lockedRows.length > 0) {
        const pedRes = await fetch(
          `${baseUrl}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(codigoPedido)}&select=id,codigo,cliente_nombre,cliente_email,total,metodo_pago,pedido_items(producto_id,nombre,precio,cantidad,archivo_url,archivo_specs_url,link_archivos,link_video)`,
          {
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`
            }
          }
        );

        if (pedRes.ok) {
          const pedRows = await pedRes.json();
          const pedidoDb = pedRows && pedRows[0];
          if (pedidoDb && pedidoDb.cliente_email) {
            try {
              const resEmail = await enviarCorreoPedidoServer({
                supabaseUrl: baseUrl,
                supabaseKey,
                codigoPedido: pedidoDb.codigo,
                cliente: {
                  nombre: pedidoDb.cliente_nombre || "Cliente",
                  email: pedidoDb.cliente_email
                },
                items: pedidoDb.pedido_items || [],
                metodoPago: pedidoDb.metodo_pago || "mercadopago",
                total: Number(pedidoDb.total || 0),
                urlTienda
              });

              if (resEmail && resEmail.success && !resEmail.simulado) {
                emailEnviado = true;
              } else {
                // Revertir lock si fue simulado o no salió
                await fetch(`${baseUrl}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(codigoPedido)}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    "apikey": supabaseKey,
                    "Authorization": `Bearer ${supabaseKey}`
                  },
                  body: JSON.stringify({ archivos_enviados: false, fecha_envio_archivos: null })
                }).catch(() => {});
              }
            } catch (emailErr) {
              console.warn(`[MP Email] Error enviando correo para ${codigoPedido}:`, emailErr.message);
              await fetch(`${baseUrl}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(codigoPedido)}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  "apikey": supabaseKey,
                  "Authorization": `Bearer ${supabaseKey}`
                },
                body: JSON.stringify({ archivos_enviados: false, fecha_envio_archivos: null })
              }).catch(() => {});
            }
          }
        }
      } else {
        // Verificar si ya estaba marcado como enviado previamente
        const checkRes = await fetch(
          `${baseUrl}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(codigoPedido)}&select=archivos_enviados`,
          {
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`
            }
          }
        );
        if (checkRes.ok) {
          const checkRows = await checkRes.json();
          if (checkRows && checkRows[0] && checkRows[0].archivos_enviados) {
            yaEnviado = true;
            emailEnviado = true;
          }
        }
      }
    }
  } catch (lockErr) {
    console.warn("[MP Email] No se pudo adquirir lock de envío automático:", lockErr.message);
  }

  return { actualizado, emailEnviado, yaEnviado };
}

module.exports = handler;
module.exports.enviarCorreoPedidoServer = enviarCorreoPedidoServer;
module.exports.procesarAprobacionMercadoPagoServer = procesarAprobacionMercadoPagoServer;
module.exports.enriquecerItemsDesdeSupabase = enriquecerItemsDesdeSupabase;
module.exports.firmarRutaStorage = firmarRutaStorage;
