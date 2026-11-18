# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 18/11/2026 — Limpieza de secretos, validación server-side y sanitización XSS.

## Estado actual
- Seguridad y Sanitización:
  - Eliminación total de credenciales y tokens hardcodeados en `api/crear-preferencia.js` y `api/webhook-mercadopago.js`.
  - Requisito estricto de variables de entorno seguras (`MP_ACCESS_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY`).
  - Validación defensiva de ítems, cantidades (1-50) y montos positivos antes de invocar la API de Mercado Pago.
  - Sanitización HTML estricta en `escaparHTML` (soporte completo de comillas simples y dobles) y eliminación de inyecciones de strings en `onclick`.
- Gestión dinámica de categorías en Panel Admin:
  - Formulario de alta rápida con validación anti-duplicados y lista con conteo de moldes y eliminación individual.
  - Reasignación defensiva automática a "Otros" al eliminar una categoría en uso.
  - Sincronización en localStorage y Supabase (clave `categorias_moldes`).
- Estética Boutique estilo Tiendanube:
  - Fuente Plus Jakarta Sans, Hero boutique, tarjetas alineadas, badges flotantes.
  - Checkout profesionalizado en 2 pasos sin desbordes horizontales.
  - Íconos oficiales vectoriales en SVG (WhatsApp, Instagram, YouTube).

## Decisiones y por qué
- Exclusión de tokens en código fuente: Previene fugas de credenciales en repositorios y asegura cumplimiento de estándares de seguridad en pasarelas de pago.
- `escaparHTML` con reemplazo de caracteres `'` y `"`: Evita vulnerabilidades XSS en atributos HTML o contextos de manipulación del DOM.
- Eventos usando `getAttribute('data-categoria')`: Evita interpolar variables directamente en código inline JS dentro del HTML.

## Aprendizajes y errores a evitar
- Nunca dejar tokens o secrets de producción como fallback en serverless functions (`process.env.VAR || "TOKEN"`).
- Mantener siempre la paleta oficial (`#845ec2`, `#c7a138`) para consistencia de marca.

## Próximos pasos
- Carga de fotos de moldes reales y enlaces a Google Drive por parte del administrador.
