# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 18/11/2026 — Actualización de WhatsApp oficial (3813581558 -> +54 9 381 358-1558 / 5493813581558).

## Estado actual
- Canales de contacto oficiales:
  - WhatsApp oficial actualizado a `+54 9 381 358-1558` (normalización automática para enlaces de chat: `5493813581558`).
  - Botón flotante, pie de página, modal de confirmación de pedido y panel admin sincronizados.
- Blindaje integral de seguridad implementado:
  - Enlaces de descarga (Google Drive / Video) restringidos solo a administradores aprobados.
  - RLS reforzado en `pedidos` y `pedido_items`.
  - Bucket `comprobantes-transferencia` privado con URLs firmadas temporales (`createSignedUrl`).
  - Validación de precios server-side en `api/crear-preferencia.js` contra Supabase.
  - Rate limiting por IP en `/api/crear-preferencia`.
  - Validación criptográfica de firmas HMAC-SHA256 (`x-signature`) en webhook de Mercado Pago.
- Gestión dinámica de categorías en Panel Admin (agregar/eliminar con reasignación a "Otros").
- Estética Boutique estilo Tiendanube con Checkout en 2 pasos.

## Decisiones y por qué
- Función `normalizarNumeroWhatsApp`: Convierte automáticamente números locales argentinos (10 dígitos, ej. `3813581558`) al estándar E.164 internacional requerido por WhatsApp (`5493813581558`).
- Migración transparente en `cargarDatosBancarios`: Reemplaza automáticamente el teléfono de prueba anterior en `localStorage` sin requerir que el usuario borre datos de navegación.

## Aprendizajes y errores a evitar
- Los números de WhatsApp argentinos requieren el código de país `54` seguido del prefijo móvil `9` antes del código de área para funcionar correctamente en `api.whatsapp.com`.

## Próximos pasos
- Ejecutar `sql/supabase-schema.sql` en el SQL Editor de Supabase si se desean aplicar los valores por defecto en la nube.
