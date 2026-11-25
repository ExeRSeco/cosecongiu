// Vercel Serverless Function: Verificación segura de pagos de Mercado Pago tras retorno del checkout
// Previene auto-aprobación fraudulenta verificando directamente contra la API oficial de Mercado Pago

const { procesarAprobacionMercadoPagoServer } = require("./enviar-email");

const IP_RATE_LIMIT = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

function verificarRateLimit(ip) {
  if (!ip || ip === "ip-desconocida") return true;
  const ahora = Date.now();
  const registro = IP_RATE_LIMIT.get(ip) || [];
  const recientes = registro.filter(t => ahora - t < RATE_LIMIT_WINDOW_MS);
  if (recientes.length >= MAX_REQUESTS_PER_WINDOW) return false;
  recientes.push(ahora);
  IP_RATE_LIMIT.set(ip, recientes);
  return true;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") return res.status(200).end();

  const forwarded = req.headers["x-forwarded-for"];
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : (req.socket?.remoteAddress || "ip-desconocida");
  if (!verificarRateLimit(clientIp)) {
    return res.status(429).json({ error: "Demasiadas solicitudes. Por favor espera un momento." });
  }

  const query = req.query || {};
  const body = req.body || {};
  const paymentId = String(query.payment_id || query.collection_id || body.payment_id || body.collection_id || "").trim();
  const codigo = String(query.codigo || query.orden || query.external_reference || body.codigo || "").trim();

  if (!paymentId || !codigo) {
    return res.status(400).json({ error: "Faltan parámetros requeridos: payment_id y codigo." });
  }

  // Validar formato numérico seguro del paymentId
  if (!/^\d+$/.test(paymentId)) {
    return res.status(400).json({ error: "Formato de payment_id inválido." });
  }

  const mpAccessToken = process.env.MP_ACCESS_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL || "https://obvboktbdbahgbvemlid.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!mpAccessToken) {
    return res.status(500).json({ error: "Pasarela no configurada en el servidor (MP_ACCESS_TOKEN ausente)." });
  }

  try {
    // 1. Consultar estado fáctico oficial en la API de Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${mpAccessToken}` }
    });

    if (!mpRes.ok) {
      console.warn(`[Verificar Pago MP] Cobro ${paymentId} no encontrado en API de Mercado Pago (HTTP ${mpRes.status})`);
      return res.status(404).json({ verified: false, error: "Cobro no encontrado en Mercado Pago." });
    }

    const pago = await mpRes.json();
    const esAprobado = pago.status === "approved";
    const refCoincide = String(pago.external_reference || "").trim().toLowerCase() === codigo.toLowerCase();

    if (!refCoincide) {
      console.warn(`[Verificar Pago MP] Referencia no coincide: ref=${pago.external_reference} vs esperado=${codigo}`);
      return res.status(403).json({
        verified: false,
        status: pago.status,
        error: "La referencia del pago no coincide con el pedido."
      });
    }

    if (!esAprobado) {
      console.info(`[Verificar Pago MP] Pago en proceso: status=${pago.status}, ref=${codigo}`);
      return res.status(200).json({
        verified: false,
        status: pago.status,
        error: (pago.status === "in_process" || pago.status === "pending")
          ? "El pago está en proceso de acreditación en Mercado Pago."
          : `El pago tiene estado: ${pago.status}`
      });
    }

    // 2. Si está aprobado y coincide la referencia, actualizar pedido en Supabase a 'completada' y enviar correo
    const host = req.headers["x-forwarded-host"] || req.headers.host || "cosecongiu.vercel.app";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const urlTienda = `${proto}://${host}`;

    const { actualizado, emailEnviado, yaEnviado } = await procesarAprobacionMercadoPagoServer({
      supabaseUrl,
      supabaseKey,
      codigoPedido: codigo,
      numeroOperacion: String(paymentId),
      urlTienda
    });

    if (actualizado) {
      console.log(`[Verificar Pago MP] ✓ Pedido ${codigo} verificado y sincronizado (emailEnviado=${emailEnviado}).`);
    }

    return res.status(200).json({
      verified: true,
      estado: "completada",
      payment_id: paymentId,
      codigo: codigo,
      actualizadoEnDb: actualizado,
      emailEnviado: Boolean(emailEnviado),
      yaEnviado: Boolean(yaEnviado)
    });

  } catch (error) {
    console.error("[Verificar Pago MP] Error:", error);
    return res.status(500).json({ error: "Error interno al verificar el pago." });
  }
};
