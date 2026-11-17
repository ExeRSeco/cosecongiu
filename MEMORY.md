# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 17/11/2026 — Checkout Pro MP completado + SQL optimizado con SECURITY DEFINER para RLS y Webhook.

## Estado actual
- Integración automática de Mercado Pago Checkout Pro completada:
  - Backend Serverless en Vercel (`api/crear-preferencia.js` y `api/webhook-mercadopago.js`).
  - Creación dinámica de preferencia con ítems, montos en ARS y `external_reference`.
  - Redirección directa a pasarela de MP y retorno automático a la tienda (`?mp_status=approved`).
  - Webhook sincronizado con Supabase vía función RPC `marcar_pedido_completado_mp`.
- Medios de pago activos y tri-modal en checkout:
  - **Mercado Pago:** Acreditación instantánea con tarjetas o saldo en cuenta.
  - **Transferencia Bancaria:** 10% de descuento automático con demora de hasta 48 horas hábiles.
  - **PayPal Internacional:** Cobro en USD manual para el exterior.
- Panel Admin y Catálogo con precios sincronizados y badges de estado y método de pago.

## Decisiones y por qué
- Serverless API en `/api`: Oculta y resguarda el Access Token de Mercado Pago fuera del código del navegador.
- Redirect nativo con `init_point`: Elimina la necesidad de cargar SDKs pesados en el cliente, respetando Vanilla JS.
- RPC `marcar_pedido_completado_mp` (SECURITY DEFINER): Permite actualizar el estado de la compra desde el Webhook/Retorno sin violar RLS ni exponer credenciales master.
- Función `es_admin_aprobado()` (SECURITY DEFINER): Elimina el error 42P17 de recursión infinita en RLS.

## Aprendizajes y errores a evitar
- Nunca referenciar la misma tabla en su propia política RLS sin SECURITY DEFINER.
- No exponer tokens privados en el cliente ni en `MEMORY.md`.
- Respetar siempre las reglas de fechas locales en reportes y órdenes.

## Próximos pasos
- Ejecutar el script SQL de migración en el editor de Supabase.
- Carga de moldes reales y enlaces finales a carpetas de Google Drive por parte del administrador.
