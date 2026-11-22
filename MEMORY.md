# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 22/11/2026 — Auditoría de calidad y eliminación de malas prácticas (a11y, debounce, storage y seguridad).

## Estado actual
- Accesibilidad (WCAG) & Semántica: Se añadieron `type="button"` explícitos a todos los botones modales/navegación, `aria-label` descriptivos a inputs de búsqueda y filtros, y soporte para cerrar cualquier modal con la tecla `Escape`.
- Rendimiento & Optimización de Búsqueda: Se implementó `debounce` (120-150ms) en la búsqueda del catálogo y panel admin, evitando re-renderizados continuos del DOM en cada pulsación.
- Seguridad en Navegación Externa: `window.open` protegido con `noopener,noreferrer` en descargas y enlaces de WhatsApp/Gmail para prevenir tabnabbing.
- Robustez en Storage: `guardarCarritoEnStorage` y `guardarPedidosEnStorage` blindados con `try...catch` contra fallos de cuota o navegación privada.
- Ciclo de Vida Limpio: Unificado el `DOMContentLoaded` duplicado en un único flujo estructurado (`procesarParametrosDescargaUrl`).
- Deep Linking & Navegación SPA: Integrado hash routing (`#producto-:id`, `#carrito`, `#admin`). Enlaces con semántica `href="#producto-${id}"` en lugar del anti-patrón `href="#"`.
- Contención Mobile en Detalle de Molde: Resuelto el desborde horizontal en pantallas estrechas (<= 400px) con `minmax(0, 1fr)`.
- Seguridad Backend & Pasarela: `marcar_pedido_completado_mp` y serverless `api/verificar-pago.js` activos.

## Decisiones y por qué
- Debounce en inputs en vivo: Mantiene la reactividad visual inmediata en los controles de limpieza ('✕') mientras aplaza el re-renderizado pesado de cards e iconos Lucide hasta que el usuario pausa la escritura.
- Tecla Escape global en modales: Estándar indispensable de usabilidad y accesibilidad para permitir al usuario descartar overlays sin recurrir únicamente al clic de mouse o tap táctil.

## Aprendizajes y errores a evitar
- Los botones sin atributo `type` adoptan `type="submit"` por defecto; siempre especificar `type="button"` fuera de formularios de envío.
- Nunca usar `href="#"` para acciones SPA que tengan ruta canónica (`#producto-X`), pues rompe la navegación por pestañas y la accesibilidad de lectores de pantalla.
- `window.open` sin `noopener,noreferrer` permite a la página destino acceder al objeto `window.opener`.
