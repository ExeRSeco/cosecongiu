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

function generarHtmlCorreo({ cliente, codigoPedido, items, metodoPago, total, urlTienda }) {
  const nombreCliente = (cliente && cliente.nombre) ? cliente.nombre.trim() : "Cliente";
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

  const urlRastreo = `${urlTienda || "https://cosecongiu.com"}?descarga=${encodeURIComponent(codigoPedido)}&email=${encodeURIComponent((cliente && cliente.email) || "")}`;

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
                    ${metodoPago === "gratuito" 
                      ? "¡Muchas gracias por sumarte a la comunidad! Aquí tenés tu molde gratuito para descargar y empezar a coser cuando quieras:"
                      : "¡Muchas gracias por tu compra! Tu pago ha sido confirmado y tus archivos digitales ya están disponibles para su descarga inmediata:"
                    }
                  </p>

                  <div style="background-color: #fbf9fe; border-left: 4px solid #845ec2; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                    <div style="font-size: 13px; color: #777777;">Código de Pedido:</div>
                    <div style="font-size: 16px; font-weight: 700; color: #583387;">${escaparHtmlEmail(codigoPedido)}</div>
                  </div>

                  <!-- LISTADO DE MOLDES Y VIDEOS -->
                  ${listaItemsHtml}

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

module.exports = async (req, res) => {
  // Cabeceras CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
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
    const { codigoPedido, cliente, items, metodoPago, total, urlTienda } = req.body || {};

    if (!codigoPedido || !cliente || !cliente.email) {
      return res.status(400).json({ error: "Datos incompletos: se requiere codigoPedido y cliente.email." });
    }

    const destinatario = cliente.email.trim().toLowerCase();

    // Verificación defensiva contra base de datos para prevenir uso indebido como spam relay
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        const resPed = await fetch(`${supabaseUrl}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(codigoPedido)}&select=id,estado,cliente_email`, {
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
          if (p.cliente_email && p.cliente_email.toLowerCase() !== destinatario) {
            console.warn(`[Envio Email] Discrepancia de correo en pedido ${codigoPedido}: ${p.cliente_email} vs ${destinatario}`);
            return res.status(403).json({ error: "El correo del destinatario no coincide con el registrado en el pedido." });
          }
        }
      } catch (errSupabase) {
        console.warn("[Envio Email] No se pudo verificar pedido en Supabase (continuando):", errSupabase.message);
      }
    }

    const asunto = metodoPago === "gratuito"
      ? `🎁 Tu Molde Gratuito está listo - Cosé con Giu`
      : `✂️ Tus Moldes Digitales están listos para descargar - Pedido ${codigoPedido}`;

    const htmlContent = generarHtmlCorreo({
      cliente,
      codigoPedido,
      items: items || [],
      metodoPago: metodoPago || "mercadopago",
      total: total || 0,
      urlTienda: urlTienda || (req.headers && req.headers.origin) || "https://cosecongiu.com"
    });

    // Verificación de credenciales de Gmail SMTP
    const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD || process.env.GMAIL_PASS;

    if (!gmailUser || !gmailPass || !nodemailer) {
      console.warn("[Envio Email] GMAIL_USER o GMAIL_APP_PASSWORD no configurados en variables de entorno.");
      return res.status(200).json({
        success: true,
        simulado: true,
        mensaje: "Correo registrado (Modo simulación: faltan variables GMAIL_USER o GMAIL_APP_PASSWORD en Vercel)."
      });
    }

    // Configuración del transporte Nodemailer con Gmail SMTP
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

    return res.status(200).json({
      success: true,
      mensajeId: info.messageId,
      destinatario: destinatario
    });

  } catch (error) {
    console.error("[Envio Email Error]:", error);
    return res.status(500).json({
      error: "Error al enviar el correo electrónico.",
      detalle: error.message
    });
  }
};
