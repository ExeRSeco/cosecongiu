# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 02/11/2026 — Control de acceso admin restrictivo con aprobación manual en Supabase.

## Estado actual
- Estructura limpia y desacoplada en carpetas modulares (`css/`, `js/`, `assets/`, `sql/`).
- Variables de entorno protegidas: `js/env.example.js` rastreado, `js/env.js` ignorado en Git.
- Sistema de Auth Admin con aprobación manual:
  - Soporta credenciales demo locales (`admin` / `giu2026`).
  - Nuevas cuentas en Supabase Auth quedan en estado `aprobado: false` en la tabla `administradores`.
  - Solo los usuarios explícitamente aprobados por el administrador principal pueden acceder al panel.
  - Formulario de recuperación de contraseña vía email y badge de identidad activo.
- Persistencia dual completa: Supabase en la nube con fallback 100% offline a `localStorage`.

## Decisiones y por qué
- Aprobación manual en Supabase: Evita que registros públicos no autorizados vean ventas, links de Drive o editen el catálogo.
- Trigger en PostgreSQL + verificación client-side: Doble capa de validación para garantizar que ninguna sesión no aprobada quede abierta.
- Doble vía de autenticación: Mantiene la app siempre testeable sin conexión y segura en producción.

## Aprendizajes y errores a evitar
- Nunca permitir auto-login tras registrarse cuando el acceso dependa de aprobación manual; revocar la sesión inmediatamente y mostrar mensaje claro.
- Traducir al español todos los errores devueltos por Auth para no confundir al usuario final.

## Próximos pasos
- Despliegue en producción en Vercel o Netlify vinculando el repositorio GitHub.
- Configuración de webhook o pasarela automática opcional (Mercado Pago Checkout Pro).
