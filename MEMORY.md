# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 02/11/2026 — Sistema completo de autenticación admin (Supabase Auth + Demo), unificación de env y seguridad Git.

## Estado actual
- Estructura limpia y desacoplada en carpetas modulares (`css/`, `js/`, `assets/`, `sql/`).
- Variables de entorno protegidas: `js/env.example.js` rastreado, `js/env.js` ignorado en Git. Prioridad: `localStorage` > `window.__ENV` > fallback.
- Sistema de Auth Admin completo:
  - Soporta credenciales demo locales (`admin` / `giu2026`).
  - Soporta login oficial con Supabase Auth vía correo y contraseña.
  - Formulario integrado de registro de nuevos administradores y recuperación de contraseña vía email.
  - Persistencia de sesión automática con Supabase (`onAuthStateChange` y `getSession`).
  - Pill de identidad visual en el encabezado del panel admin (`#admin-user-badge`).
- Persistencia dual completa: Supabase en la nube con fallback 100% offline a `localStorage`.

## Decisiones y por qué
- Doble vía de autenticación: Mantiene la app siempre testeable sin conexión (demo `admin`/`giu2026`) y habilita seguridad robusta en producción mediante tokens JWT de Supabase Auth.
- Carga de `env.js` antes de scripts: Permite configurar credenciales locales de forma declarativa sin build tools y sin exponer secretos en el repositorio.
- Auto-restauración de sesión: Evita que el administrador tenga que reingresar credenciales en cada recarga si ya tiene un token válido en Supabase.

## Aprendizajes y errores a evitar
- Nunca subir `js/env.js` a Git; mantener siempre actualizada la plantilla `js/env.example.js`.
- Traducir al español todos los errores devueltos por el backend de Auth para no confundir al usuario final.

## Próximos pasos
- Despliegue en producción en Vercel o Netlify vinculando el repositorio GitHub.
- Configuración de webhook o pasarela automática opcional (Mercado Pago Checkout Pro).
