// Vercel Serverless Function: Webhook de Notificaciones de Mercado Pago (IPN)
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Credenciales activas con soporte para Service Role Key o Anon Key
  const mpAccessToken = process.env.MP_ACCESS_TOKEN || "APP_USR-6717638260928914-111710-8cb0aaaee1beee31563d0746b65aa3e3-422418037";
  const supabaseUrl = process.env.SUPABASE_URL || "https://obvboktbdbahgbvemlid.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idmJva3RiZGJhaGdidmVtbGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMjAyMzMsImV4cCI6MjEwODc5NjIzM30.QJLpImAxgOQpOoObR8sATEninUZqPDYwLpo8FxKK9jU";

  try {
    const query = req.query || {};
    const body = req.body || {};
    const type = query.type || query.topic || body.type || body.topic;
    const paymentId = query["data.id"] || query.id || (body.data && body.data.id) || body.id;

    console.log("[Webhook MP] Evento recibido:", { type, paymentId });

    if (paymentId && (type === "payment" || !type)) {
      // 1. Consultamos el estado fáctico del pago directamente en la API oficial de Mercado Pago
      const pagoRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${mpAccessToken}`
        }
      });

      if (pagoRes.ok) {
        const pago = await pagoRes.json();
        console.log("[Webhook MP] Detalle del cobro:", {
          id: pago.id,
          estado: pago.status,
          referencia: pago.external_reference,
          monto: pago.transaction_amount
        });

        // 2. Si el pago fue acreditado y aprobado, actualizamos el pedido en Supabase
        if (pago.status === "approved" && pago.external_reference) {
          const codigoPedido = pago.external_reference;

          // Intentar primero mediante RPC con SECURITY DEFINER (bypass seguro de RLS)
          let actualizado = false;
          try {
            const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/marcar_pedido_completado_mp`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`
              },
              body: JSON.stringify({
                p_codigo: codigoPedido,
                p_numero_operacion: String(pago.id)
              })
            });

            if (rpcRes.ok) {
              actualizado = true;
              console.log(`[Webhook MP] ✓ Pedido ${codigoPedido} marcado como 'completada' en Supabase via RPC.`);
            }
          } catch (rpcErr) {
            console.warn("[Webhook MP] Error al invocar RPC:", rpcErr);
          }

          // Fallback por PATCH directo (por ejemplo si se usa Service Role Key)
          if (!actualizado) {
            const patchRes = await fetch(`${supabaseUrl}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(codigoPedido)}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Prefer": "return=minimal"
              },
              body: JSON.stringify({
                estado: "completada",
                numero_operacion: String(pago.id)
              })
            });

            if (patchRes.ok) {
              console.log(`[Webhook MP] ✓ Pedido ${codigoPedido} marcado como 'completada' en Supabase via PATCH.`);
            } else {
              console.warn(`[Webhook MP] No se pudo actualizar en Supabase:`, await patchRes.text());
            }
          }
        }
      } else {
        console.warn("[Webhook MP] No se pudo consultar pago en MP:", pagoRes.status);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[Webhook MP Error]", err);
    return res.status(200).json({ ok: false, error: err.message });
  }
};

