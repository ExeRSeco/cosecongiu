// Vercel Serverless Function: Creación de Preferencia de Pago en Mercado Pago
module.exports = async (req, res) => {
  // Configuración de cabeceras CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
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

  try {
    const { codigoPedido, cliente, items } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "El pedido no contiene ítems para cobrar." });
    }

    // Token oficial de producción de Mercado Pago para Cosé con Giu
    const mpAccessToken = process.env.MP_ACCESS_TOKEN || "APP_USR-6717638260928914-111710-8cb0aaaee1beee31563d0746b65aa3e3-422418037";

    // URL base de la tienda en Vercel o producción
    const host = req.headers["x-forwarded-host"] || req.headers.host || "cosecongiu.vercel.app";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const siteUrl = `${proto}://${host}`;

    // Mapeo de ítems del molde al formato requerido por Mercado Pago
    const preferenceItems = items.map(item => {
      const precioUnitario = Number(item.precio || 0);
      return {
        id: String(item.id || "molde"),
        title: String(item.nombre || "Molde Digital en PDF").slice(0, 250),
        description: "Patrón de costura descargable en PDF con guía y video",
        quantity: Math.max(1, Number(item.cantidad || 1)),
        unit_price: Math.max(0, precioUnitario),
        currency_id: "ARS"
      };
    });

    const payerEmail = (cliente && cliente.email && cliente.email.includes("@")) 
      ? cliente.email.trim().toLowerCase() 
      : "comprador@gmail.com";

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
