// Vercel Serverless Function: Creación de Preferencia de Pago en Mercado Pago
// Protección: Rate limiting por IP y validación de precios oficial contra base de datos Supabase

const IP_RATE_LIMIT = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 20; // Máximo 20 preferencias por IP por minuto

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

module.exports = async (req, res) => {
  // Configuración de cabeceras CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
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

  // Rate Limiting anti-abuso
  const forwarded = req.headers["x-forwarded-for"];
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : (req.socket?.remoteAddress || "ip-desconocida");
  if (!verificarRateLimit(clientIp)) {
    return res.status(429).json({ error: "Demasiadas solicitudes. Por favor espera un momento antes de volver a intentar." });
  }

  try {
    const { codigoPedido, cliente, items } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "El pedido no contiene ítems para cobrar." });
    }

    // Token oficial de producción de Mercado Pago desde variables de entorno
    const mpAccessToken = process.env.MP_ACCESS_TOKEN;
    if (!mpAccessToken) {
      console.error("[Crear Preferencia] Error: MP_ACCESS_TOKEN no está configurado en las variables de entorno del servidor.");
      return res.status(500).json({ error: "La pasarela de pagos no está configurada en el servidor (MP_ACCESS_TOKEN ausente)." });
    }

    // URL base de la tienda en Vercel o producción
    const host = req.headers["x-forwarded-host"] || req.headers.host || "cosecongiu.vercel.app";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const siteUrl = `${proto}://${host}`;

    // Validación y mapeo seguro de ítems del molde al formato requerido por Mercado Pago
    const preferenceItems = [];
    for (const item of items) {
      const precioUnitario = Number(item.precio);
      const cantidad = parseInt(item.cantidad, 10);

      // Verificación de integridad: precios y cantidades válidas
      if (isNaN(precioUnitario) || precioUnitario <= 0) {
        return res.status(400).json({ error: `El producto "${String(item.nombre || 'Molde')}" tiene un precio inválido.` });
      }

      if (isNaN(cantidad) || cantidad < 1 || cantidad > 50) {
        return res.status(400).json({ error: `La cantidad solicitada para "${String(item.nombre || 'Molde')}" no es válida.` });
      }

      preferenceItems.push({
        id: String(item.id || "molde").replace(/[^\w-]/g, "").slice(0, 50),
        title: String(item.nombre || "Molde Digital en PDF").replace(/[\r\n]/g, " ").trim().slice(0, 250),
        description: "Molde de costura descargable en PDF con guía y video",
        quantity: cantidad,
        unit_price: Math.round(precioUnitario),
        currency_id: "ARS"
      });
    }

    // Validación y recálculo estricto contra Supabase para prevenir manipulación del precio en el cliente
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const idsNumericos = preferenceItems
          .map(i => i.id)
          .filter(id => !isNaN(Number(id)) && Number(id) > 0);

        if (idsNumericos.length > 0) {
          const idsQuery = idsNumericos.join(",");
          const resProd = await fetch(`${supabaseUrl}/rest/v1/productos?id=in.(${idsQuery})&select=id,nombre,precio,en_promo,precio_promo`, {
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`
            }
          });

          if (resProd.ok) {
            const dbProducts = await resProd.json();
            const dbMap = new Map();
            (dbProducts || []).forEach(p => dbMap.set(String(p.id), p));

            for (const item of preferenceItems) {
              const prodDb = dbMap.get(String(item.id));
              if (prodDb) {
                const precioOficial = Math.round(
                  (prodDb.en_promo && Number(prodDb.precio_promo) > 0)
                    ? Number(prodDb.precio_promo)
                    : Number(prodDb.precio)
                );

                // Forzar siempre el precio oficial registrado en la base de datos
                if (item.unit_price !== precioOficial) {
                  console.info(`[Crear Preferencia] Sincronizando precio oficial para molde ID ${item.id}: $${precioOficial} (enviado: $${item.unit_price})`);
                  item.unit_price = precioOficial;
                }
              } else {
                return res.status(400).json({ error: `El producto ID "${item.id}" no existe en el catálogo oficial.` });
              }
            }
          }
        }
      } catch (errSupabase) {
        console.warn("[Crear Preferencia] Aviso: No se pudo verificar precios en tiempo real con Supabase:", errSupabase.message);
      }
    }

    const payerEmail = (cliente && cliente.email && cliente.email.includes("@")) 
      ? cliente.email.trim().toLowerCase() 
      : "comprador@email.com";

    const payerNombre = (cliente && cliente.nombre) ? cliente.nombre.trim().slice(0, 80) : "Cliente";

    const codigo = String(codigoPedido || `ORD-${Date.now()}`);

    const payload = {
      items: preferenceItems,
      payer: {
        name: payerNombre,
        email: payerEmail
      },
      back_urls: {
        success: `${siteUrl}/?mp_status=approved&orden=${encodeURIComponent(codigo)}`,
        pending: `${siteUrl}/?mp_status=pending&orden=${encodeURIComponent(codigo)}`,
        failure: `${siteUrl}/?mp_status=failure&orden=${encodeURIComponent(codigo)}`
      },
      auto_return: "approved",
      external_reference: codigo,
      notification_url: `${siteUrl}/api/webhook-mercadopago`,
      statement_descriptor: "COSE CON GIU"
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mpAccessToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("[Mercado Pago Error]", data);
      return res.status(mpResponse.status).json({
        error: data.message || "Error al generar la preferencia en Mercado Pago",
        detalles: data
      });
    }

    return res.status(200).json({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point
    });
  } catch (error) {
    console.error("[Crear Preferencia Error]", error);
    return res.status(500).json({
      error: "Error interno al comunicarse con Mercado Pago",
      mensaje: error.message
    });
  }
};

