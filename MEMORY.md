# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 28/10/2026 — Preparación completa para producción y conexión Supabase.

## Estado actual
- Arquitectura Vanilla Web Stack lista para producción sin dependencias de build.
- Backend en la nube: Supabase integrado (PostgreSQL, Auth real y Storage para imágenes) con fallback transparente a `localStorage`.
- Modal de configuración de Supabase accesible desde el panel admin con indicador de estado (online/local/error) y comprobación de conexión.
- Subida de imágenes al bucket `moldes-imagenes` en Supabase Storage con URLs públicas automáticas.
- Archivos de despliegue y SEO listos: `vercel.json`, `netlify.toml`, `robots.txt`, `sitemap.xml`, Open Graph y Twitter Cards.
- Credenciales demo vigentes: `admin` / `giu2026` con soporte para login vía email con Supabase Auth.

## Decisiones y por qué
- Mantener Vanilla Stack + Supabase: Cero tiempo de build, costo de hosting $0 (Vercel/Netlify), máxima velocidad de carga móvil y cero necesidad de reescribir código.
- Configuración dinámica en localStorage: Permite conectar el backend desde la UI web sin exponer credenciales fijas en el repositorio ni requerir recompilaciones.
- Fallback automático a localStorage: Si Supabase no está configurado o falla la red, la tienda sigue operando sin interrumpir la experiencia de compra ni del admin.

## Aprendizajes y errores a evitar
- Nunca forzar subida de Base64 a PostgreSQL cuando se puedan usar buckets de Storage; ahorra cuota de base de datos y acelera consultas.
- Siempre cargar datos iniciales de localStorage de forma síncrona para render instantáneo, y sincronizar con la nube en segundo plano para evitar parpadeos de pantalla blanca.

## Próximos pasos
- Despliegue en Vercel o Netlify vinculando el dominio personalizado (ej. `cosecongiu.com`).
- Configuración de webhook o pasarela automática opcional (Mercado Pago Checkout Pro).
