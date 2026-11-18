// Vercel Serverless Function: Webhook de Notificaciones de Mercado Pago (IPN)
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Credenciales activas exclusivamente desde variables de entorno seguras
  const mpAccessToken = process.env.MP_ACCESS_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL || "https://obvboktbdbahgbvemlid.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!mpAccessToken) {
    console.error("[Webhook MP] Error: MP_ACCESS_TOKEN no está configurado en las variables de entorno.");
    return res.status(500).json({ error: "Configuración incompleta en el servidor (MP_ACCESS_TOKEN ausente)." });
  }

  if (!supabaseKey) {
    console.error("[Webhook MP] Error: Credencial de Supabase no configurada (SUPABASE_SERVICE_ROLE_KEY o SUPABASE_ANON_KEY requerida).");
    return res.status(500).json({ error: "Configuración incompleta en el servidor (Supabase Key ausente)." });
  }

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

