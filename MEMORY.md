# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 19/11/2026 — Corrección de persistencia de nuevos moldes y renderizado de descargas.

## Estado actual
- Descarga directa y entrega de moldes:
  - Bucket privado Supabase `moldes-archivos` (PDF/ZIP): descargable con URLs firmadas (24h) tras validación estricta de orden pagada/aprobada (`obtener_descargas_pedido`).
  - Videos tutoriales: exclusivos en YouTube (enlaces entregados al comprador).
  - Admisión universal de correos: cualquier correo electrónico válido recibe comprobantes y enlaces.
  - Moldes gratuitos: flujo express 1-click (Nombre + Correo), $0, descarga inmediata en pantalla y correo automático.
  - Transferencias: Giu aprueba el pago en panel admin con 1 clic ("Aprobar y Enviar Moldes"), lo cual actualiza Supabase, genera links y dispara email.
  - Modal "Mis Descargas": consulta con código de pedido y correo. Incluye botón directo de muestra si está pendiente y tarjetas de descarga segura por índice (`descargarItemConsultado`) cuando está aprobado.
- Seguridad y persistencia:
  - Nuevos moldes: Supabase inserta con ID autogenerado (`esNuevo`), evitando updates fallidos en IDs inexistentes que provocaban que los moldes desaparecieran al recargar.
  - Sincronización robusta: fusión defensiva que preserva moldes locales y fallback relacional en `pedido_items` sin fallos de clave foránea.
  - Aprobación flexible: `supabaseActualizarEstadoPedido` soporta tanto ID numérico como código `ORD-XXXX`.

## Decisiones y por qué
- Inserción vs Update en Supabase: Al dar de alta un producto no se debe enviar el ID local temporal en el update; se utiliza `insert` para que PostgreSQL asigne el ID real y se devuelva al frontend.
- Snapshot de archivos en pedido: Se almacena `archivoUrl` directamente en los ítems del pedido para que la descarga esté siempre disponible incluso ante cambios en el catálogo.

## Aprendizajes y errores a evitar
- Contraseña de aplicación Google: En `myaccount.google.com/apppasswords`, crear una con nombre "Tienda Cose con Giu" y copiar los 16 caracteres generados a la variable `GMAIL_APP_PASSWORD` en Vercel.
- Project URL del proyecto `cosecongiu`: `https://obvboktbdbahgbvemlid.supabase.co`.
- Dashboard Supabase: Usar siempre Publishable key (`sb_publishable_...`) o legacy `anonKey`. NUNCA `sb_secret_...` en el navegador.

## Próximos pasos
- Ejecutar la actualización de `sql/supabase-schema.sql` en el SQL Editor de Supabase si se desea actualizar la RPC en la nube.
- Cargar `GMAIL_APP_PASSWORD` en Vercel.
