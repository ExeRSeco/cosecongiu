# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 18/11/2026 — Descargas directas, moldes gratis, bucket privado `moldes-archivos` y automatización Gmail SMTP.

## Estado actual
- Descarga directa y entrega de moldes:
  - Bucket privado Supabase `moldes-archivos` (PDF/ZIP): solo descargable con URLs firmadas (24h) tras validación estricta de orden pagada/aprobada (`obtener_descargas_pedido`).
  - Videos tutoriales: exclusivos en YouTube (enlaces entregados al comprador).
  - Moldes gratuitos (Freebies): flujo express 1-click (Nombre + Gmail), $0, descarga inmediata en pantalla y correo automático.
  - Transferencias: Giu aprueba el pago en panel admin con 1 clic ("Aprobar y Enviar Moldes"), lo cual actualiza Supabase, genera links y dispara email.
  - Notificaciones por correo: función serverless `/api/enviar-email` con Gmail SMTP directo (Nodemailer).
  - Modal "Mis Descargas" en el header para que clientes consulten sus moldes en cualquier momento con código y Gmail.
- Pasarelas y medios de pago (ARS): Mercado Pago Checkout Pro oficial y Transferencia con 10% OFF. WhatsApp oficial: `+54 9 381 358-1558`.

## Decisiones y por qué
- Descargas protegidas: No se exponen URLs públicas de patrones en el frontend; se generan URLs firmadas tras validar el pedido en PostgreSQL.
- Gmail SMTP directo: Solución gratuita nativa para enviar correos sin costo mensual ni límites agresivos de tiers free.

## Aprendizajes y errores a evitar
- Supabase Dashboard (Settings -> API Keys): Usar siempre la **Publishable key** (`sb_publishable_...`) o la clásica `anonKey` (en "View legacy API keys"). NUNCA la **Secret key** (`sb_secret_...`) en el frontend o navegador.
- Project URL del proyecto `cosecongiu`: `https://ohvboktbdhahgbvemlid.supabase.co` (con 'h', no 'b').

## Próximos pasos
- Ejecutar `sql/supabase-schema.sql` en el SQL Editor de Supabase para inicializar el bucket `moldes-archivos` y las funciones RPC.
- Configurar `GMAIL_USER` y `GMAIL_APP_PASSWORD` en las variables de entorno de Vercel.
