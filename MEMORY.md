# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 19/11/2026 — Validación universal de correos, limpieza de interfaz, seguridad en admin y rate limit en emails.

## Estado actual
- Descarga directa y entrega de moldes:
  - Bucket privado Supabase `moldes-archivos` (PDF/ZIP): descargable con URLs firmadas (24h) tras validación estricta de orden pagada/aprobada (`obtener_descargas_pedido`).
  - Videos tutoriales: exclusivos en YouTube (enlaces entregados al comprador).
  - Admisión universal de correos: se eliminó la restricción obligatoria de `@gmail.com`; cualquier correo electrónico válido recibe comprobantes y enlaces.
  - Moldes gratuitos: flujo express 1-click (Nombre + Correo), $0, descarga inmediata en pantalla y correo automático.
  - Transferencias: Giu aprueba el pago en panel admin con 1 clic ("Aprobar y Enviar Moldes"), lo cual actualiza Supabase, genera links y dispara email.
  - Notificaciones por correo: función serverless `/api/enviar-email` con Gmail SMTP directo (Nodemailer) y protección anti-spam por IP rate limiting.
  - Modal "Mis Descargas": consulta con código de pedido y correo para volver a descargar moldes de por vida.
- Seguridad y acceso:
  - Eliminado backdoor de claves hardcodeadas (`giu2026`). Autenticación 100% oficial mediante Supabase Auth (`auth.users`) con alias opcional `admin` -> `cosecongiu@gmail.com`.
  - Limpieza visual: eliminada información redundante y paréntesis explicativos innecesarios en toda la interfaz.

## Decisiones y por qué
- Descargas protegidas: No se exponen URLs públicas de patrones en el frontend; se generan URLs firmadas tras validar el pedido en PostgreSQL.
- Correo universal: Al contar con descarga web directa y firmado temporal de Supabase Storage, no se requiere cuenta de Google Drive del comprador.
- Gmail SMTP con Contraseña de Aplicación: Solución sin costo para enviar correos transaccionales desde `cosecongiu@gmail.com`.

## Aprendizajes y errores a evitar
- Contraseña de aplicación Google: En `myaccount.google.com/apppasswords`, crear una con nombre "Tienda Cose con Giu" y copiar los 16 caracteres generados a la variable `GMAIL_APP_PASSWORD` en Vercel.
- Project URL del proyecto `cosecongiu`: `https://obvboktbdbahgbvemlid.supabase.co`.
- Dashboard Supabase: Usar siempre Publishable key (`sb_publishable_...`) o legacy `anonKey`. NUNCA `sb_secret_...` en el navegador.

## Próximos pasos
- Pegar la contraseña de aplicación de 16 caracteres en Vercel (`GMAIL_APP_PASSWORD`) y confirmar `GMAIL_USER=cosecongiu@gmail.com`.
