# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 17/11/2026 — Checkout Pro de Mercado Pago 100% automatizado con Serverless API y Webhook IPN en Vercel.

## Estado actual
- Integración automática de Mercado Pago Checkout Pro completada:
  - Backend Serverless en Vercel (`api/crear-preferencia.js` y `api/webhook-mercadopago.js`).
  - Creación dinámica de preferencia con ítems, montos en ARS y `external_reference`.
  - Redirección directa a pasarela oficial de MP y retorno automático a la tienda (`?mp_status=approved`).
  - Webhook sincronizado con Supabase para marcar compras aprobadas en segundo plano.
- Medios de pago activos y tri-modal en checkout:
  - **Mercado Pago:** Acreditación instantánea con tarjetas o saldo en cuenta.
  - **Transferencia Bancaria:** 10% de descuento automático con demora de hasta 48 horas hábiles.
  - **PayPal Internacional:** Cobro en USD manual para el exterior.
- Panel Admin y Catálogo con precios sincronizados y badges de estado y método de pago.

## Decisiones y por qué
- Serverless API en `/api`: Oculta y resguarda el Access Token de Mercado Pago fuera del código del navegador.
- Redirect nativo con `init_point`: Elimina la necesidad de cargar SDKs pesados en el cliente, respetando la filosofía Vanilla JS.
- Sincronización dual (Retorno + Webhook): Garantiza que si el usuario cierra la ventana, el webhook de MP igualmente actualice la orden en Supabase.

## Aprendizajes y errores a evitar
- Nunca exponer tokens privados en el cliente ni en `MEMORY.md`.
- Asegurar que `vercel.json` no reescriba `/api/*` hacia `/index.html`.
- Respetar siempre las reglas de fechas locales en reportes y órdenes.

## Próximos pasos
- Carga de moldes reales y enlaces finales a carpetas de Google Drive por parte del administrador.
