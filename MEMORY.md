# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 25/11/2026 — Corrección integral de descargas MP (RLS SECURITY DEFINER + email automático) y envío manual desde Admin.

## Estado actual
- Descargas Seguras y RLS (`sql/supabase-schema.sql`): Añadida función `puede_descargar_archivo_molde()` (`SECURITY DEFINER`) para permitir firma de URLs a compradores `anon` en Storage privado. `registrar_pedido_checkout` ahora copia rutas reales desde `productos` y se incluyó reparación de ítems históricos vacíos.
- Envío Automático MP & Firma Server-Side (`api/enviar-email.js`, `api/verificar-pago.js`, `api/webhook-mercadopago.js`): Lock atómico (`archivos_enviados=false -> true`) para enviar correo una sola vez con enlaces firmados por 7 días al aprobarse MP, con respaldo en `procesarRetornoMercadoPago()`.
- Herramienta Admin de Envío Manual (`#modal-admin-enviar-molde`): Botón en cabecera admin y en cada tarjeta del catálogo para enviar cualquier molde del catálogo por email ante errores, autenticado vía JWT de Supabase Auth.
- Retorno Robusto de Mercado Pago: `procesarRetornoMercadoPago()` y `api/verificar-pago.js` soportan estados `approved`, `pending` e `in_process`, con acceso directo a "Descargar mis moldes ahora" al aprobarse.
- Avisos de Entrega Exclusiva por Email & Textarea: Cuadros informativos en checkout/confirmación y `<textarea>` con `white-space: pre-line`.
- Precios ARS sin centavos y Cache Busting: Redondeo entero universal, `step="1"`, `?v=2.6` en `index.html` y `Cache-Control` en `vercel.json`.
- Accesibilidad, Rendimiento & Seguridad: `type="button"`, Escape en modales, debounce, `noopener,noreferrer`, deep linking `#producto-:id`, contención mobile y `try...catch` en Storage.

## Decisiones y por qué
- `SECURITY DEFINER` en Storage RLS y consulta en backend: El rol público `anon` tiene revocado el `SELECT` en `pedidos`, `pedido_items` y columnas privadas de `productos`, por lo que las políticas de `storage.objects` deben delegar la validación en una función `SECURITY DEFINER`.
- Precios ARS sin centavos: En Argentina (ARS) no se usan centavos; todo monto ARS se redondea a entero (`Math.round`).

## Aprendizajes y errores a evitar
- Nunca consultar tablas con `SELECT` revocado a `anon` directamente dentro de una política RLS de `storage.objects` sin `SECURITY DEFINER`; hace fallar `createSignedUrl` para visitantes anónimos.
- Los precios con descuento porcentual en ARS deben redondearse a entero.
- Siempre especificar `type="button"` fuera de formularios y evitar `href="#"` si hay ruta canónica.
