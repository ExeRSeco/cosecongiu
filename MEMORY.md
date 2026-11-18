# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 18/11/2026 — Checkout simplificado (Mercado Pago + Transferencia bancaria 10% OFF; eliminación total de PayPal y link manual MP).

## Estado actual
- Medios de pago simplificados exclusivamente a nivel nacional (ARS):
  - Mercado Pago: Pasarela oficial Checkout Pro (/api/crear-preferencia) con tarjetas y saldo en cuenta.
  - Transferencia Bancaria: Datos bancarios (CBU/CVU/Alias) con 10% OFF automático y carga de comprobante.
  - Eliminada opción PayPal (USD) y link manual de cobro de MP para evitar confusiones y ventas internacionales prematuras.
- Canales de contacto oficiales:
  - WhatsApp oficial: `+54 9 381 358-1558` (normalización automática para enlaces de chat: `5493813581558`).
- Blindaje integral de seguridad implementado:
  - Enlaces de descarga (Google Drive / Video) restringidos solo a administradores aprobados.
  - RLS reforzado en `pedidos` y `pedido_items`.
  - Bucket `comprobantes-transferencia` privado con URLs firmadas temporales.
  - Validación de precios server-side en `api/crear-preferencia.js` contra Supabase.
  - Rate limiting por IP y validación HMAC-SHA256 en webhooks MP.

## Decisiones y por qué
- Eliminación de PayPal y precios USD: La tienda opera 100% en el mercado argentino. Se simplificó la UX removiendo campos en dólares, tabs y pills.
- Eliminación de link manual de MP: Canaliza las compras por la pasarela automatizada oficial o transferencia directa con 10% OFF.

## Aprendizajes y errores a evitar
- En Supabase Dashboard (Settings -> API Keys), la clave a utilizar en el frontend es la **Publishable key** (`sb_publishable_...` o la clásica `anonKey`), NUNCA la **Secret key** (`sb_secret_...` / `service_role`).

## Próximos pasos
- Ejecutar `sql/supabase-schema.sql` en el SQL Editor de Supabase si se desean sincronizar los valores por defecto en la nube.
