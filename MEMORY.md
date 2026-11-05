# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 04/11/2026 — App lista para el público: FAQ, botón flotante de WhatsApp, guía de impresión A4, metatags Open Graph y canales de contacto editables en admin.

## Estado actual
- Tienda desplegada y lista para lanzamiento comercial en Vercel.
- Confianza y experiencia de compra optimizadas:
  - Sección interactiva de Preguntas Frecuentes (FAQ) sobre entrega en 1 hora, impresión en A4 y talles.
  - Bloque de guía de impresión con recordatorio de calibración (5x5 cm) en el detalle del molde.
  - Botón flotante interactivo de WhatsApp en la tienda para consultas en vivo.
  - Pie de página enriquecido con enlaces a Instagram, WhatsApp oficial y sellos de confianza.
  - Metadatos Open Graph completos para previsualización atractiva al compartir en Instagram y WhatsApp.
- Configuración de la tienda desde el Panel Admin:
  - Datos bancarios (Banco, Titular, Alias, CBU, CUIT) y canales de contacto (WhatsApp e Instagram) editables dinámicamente con persistencia en Supabase (`tienda_config`) y `localStorage`.
- Checkout y administración de transferencias:
  - Subida de comprobantes a Supabase Storage con fallback Base64, registro de N° de operación y visor modal.
  - Generación de enlace de WhatsApp con el número oficial configurado en el panel.

## Decisiones y por qué
- WhatsApp editable en admin: Evita tener números de teléfono fijos o hardcodeados en el código.
- FAQ y guía de impresión visibles: Resuelven las dos mayores fricciones de venta (desconfianza en entrega y dudas sobre cómo imprimir).
- Open Graph canónico: Asegura que el enlace se comparta con imagen de portada y descripción clara en redes sociales.

## Aprendizajes y errores a evitar
- Limpiar caracteres no numéricos al construir URLs de `api.whatsapp.com`.
- Mantener diseño no invasivo del botón flotante en pantallas móviles para no bloquear el carrito ni el checkout.

## Próximos pasos
- Carga de los moldes reales con sus fotos y enlaces finales a Google Drive por parte del administrador.
