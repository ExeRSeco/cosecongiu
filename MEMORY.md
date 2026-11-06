# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 06/11/2026 — Optimizador y compresor nativo de imágenes integrado (HTML5 Canvas en WebP/JPEG), reduciendo peso en un 85-98%.

## Estado actual
- Tienda desplegada y lista para lanzamiento comercial en Vercel.
- Optimización y compresión nativa de imágenes:
  - Función `optimizarImagen()` en Vanilla JS (HTML5 Canvas) sin dependencias externas.
  - Reduce fotos de moldes y comprobantes a máx. 1200 px y exporta en WebP/JPEG al 82% de calidad.
  - Ahorro de espacio de 85% a 98% (de 5-15 MB a ~120-250 KB por imagen), protegiendo la cuota gratuita de Supabase Storage (1 GB) y la velocidad de carga móvil.
- Confianza y experiencia de compra optimizadas:
  - FAQ interactiva, guía de calibración de impresión (5x5 cm) en detalle de producto y botón flotante de WhatsApp.
  - Footer enriquecido con sellos de confianza y enlaces a redes.
  - Metadatos Open Graph completos para previsualización al compartir en Instagram y WhatsApp.
- Configuración de la tienda desde el Panel Admin:
  - Datos bancarios y canales de contacto (WhatsApp e Instagram) editables dinámicamente (`tienda_config` en Supabase y `localStorage`).
- Checkout y administración de transferencias:
  - Subida de comprobantes optimizados a Supabase Storage con fallback Base64, registro de N° de operación y visor modal.

## Decisiones y por qué
- Compresión client-side en Canvas: Evita costos de procesamiento en servidor, previene que fotos pesadas agoten el 1 GB de Supabase y acelera la carga en celulares con datos 4G.
- WebP con fallback JPEG: Formato de vanguardia ultra liviano con soporte universal garantizado.
- WhatsApp editable en admin: Elimina números fijos o hardcodeados en el código.

## Aprendizajes y errores a evitar
- Nunca subir fotos crudas de smartphone (>8 MB) a Storage ni a `localStorage`.
- Los PDFs de comprobantes se omiten de la compresión en Canvas para preservar su estructura vectorial.

## Próximos pasos
- Carga de los moldes reales con sus fotos y enlaces finales a Google Drive por parte del administrador.
