# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 18/11/2026 — Blindaje integral de seguridad (RLS, URLs firmadas, webhook HMAC, rate limiting y DB price cross-check).

## Estado actual
- Blindaje integral de seguridad implementado:
  - Enlaces de descarga (Google Drive / Video) restringidos: solo accesibles por admins aprobados (RLS y privilegios por columna).
  - RLS reforzado en `pedidos` (forzando estado inicial `pendiente` y total > 0) y en `pedido_items` (montos y cantidades válidos).
  - Bucket `comprobantes-transferencia` privado con URLs firmadas temporales (`createSignedUrl`) para previsualización admin.
  - Validación de precios server-side en `api/crear-preferencia.js` contra la tabla `productos` de Supabase (previene tampering).
  - Rate limiting por IP en `/api/crear-preferencia` (máx. 20 peticiones/min) contra spam de bots.
  - Validación criptográfica de firmas HMAC-SHA256 (`x-signature`) con `crypto.timingSafeEqual` en webhook de Mercado Pago.
  - Cero secretos hardcodeados y sanitización XSS estricta en todo el frontend.
- Gestión dinámica de categorías en Panel Admin (agregar/eliminar con reasignación defensiva a "Otros").
- Estética Boutique estilo Tiendanube con Checkout en 2 pasos sin desbordes.

## Decisiones y por qué
- Ocultar links de descarga del catálogo público: Evita que usuarios sin pagar descarguen PDFs de Drive mediante DevTools o consultas a Supabase.
- Bucket de comprobantes privado: Protege la información bancaria y datos personales de compradores.
- Verificación de precios en BD: Garantiza que nadie pueda pagar un molde a un precio manipulado en el cliente.
- Timing-safe HMAC en Webhook: Evita ataques de temporización e impersonación de eventos de pago de Mercado Pago.

## Aprendizajes y errores a evitar
- Los buckets de storage con datos personales nunca deben ser públicos.
- Ejecutar el esquema SQL en Supabase tras modificar `sql/supabase-schema.sql` para aplicar las nuevas políticas RLS.

## Próximos pasos
- Ejecutar `sql/supabase-schema.sql` en el SQL Editor de Supabase para activar las nuevas políticas RLS y de almacenamiento.
