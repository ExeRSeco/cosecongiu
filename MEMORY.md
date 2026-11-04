# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 04/11/2026 — Despliegue en Vercel completado, purga de datos demo y endurecimiento de seguridad (RLS, CSP, HSTS).

## Estado actual
- Tienda desplegada y funcionando en producción en Vercel.
- Datos demo purgados al 100%:
  - Eliminado el bypass y credenciales demo (`admin` / `giu2026`).
  - Eliminados los pedidos de prueba mock (`PEDIDOS_POR_DEFECTO = []`).
  - Eliminados los botones de restablecimiento de prueba en la interfaz.
- Autenticación administrativa exclusiva vía Supabase Auth con aprobación manual en tabla `administradores`.
- Seguridad perimetral y de base de datos de grado de producción:
  - Cabeceras HTTP estrictas en `vercel.json` y `netlify.toml` (CSP, HSTS, Permissions-Policy, X-Frame-Options: DENY, nosniff).
  - RLS blindado en Supabase: solo administradores aprobados pueden modificar catálogo, consultar/editar ventas o subir imágenes al bucket.

## Decisiones y por qué
- Purga de credenciales fijas: Previene brechas de seguridad en producción y asegura que todo acceso sea rastreable en Supabase Auth.
- RLS con subquery de administradores: Impide que cualquier petición directa con clave pública anon modifique precios, borre moldes o lea datos personales de compradores.
- CSP estricto: Bloquea vectores de inyección XSS y restringe conexiones externas únicamente a Supabase y CDNs de Lucide.

## Aprendizajes y errores a evitar
- Nunca dejar `USING (true)` en operaciones destructivas o de lectura de pedidos en RLS cuando ya se cuenta con sistema de Auth.
- Validar siempre que CSP incluya `wss://*.supabase.co` para no romper websockets en tiempo real.

## Próximos pasos
- Configuración de webhook o pasarela automática opcional (Mercado Pago Checkout Pro).
- Automatización del despacho de enlaces por correo electrónico.
