# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 22/11/2026 — Aplicación del 10% de descuento automático con Transferencia Bancaria.

## Estado actual
- Descuento 10% OFF con Transferencia: Aplicado en barra superior, tarjetas de catálogo (`.price-transfer-pill`), vista detalle (`.product-price-transfer-tag`), carrito, desglose automático en modal checkout (`subtotal - 10% = total`), pedido registrado y panel admin.
- Accesibilidad (WCAG) & Semántica: Se añadieron `type="button"` explícitos a todos los botones modales/navegación, `aria-label` descriptivos a inputs de búsqueda y filtros, y soporte para cerrar cualquier modal con la tecla `Escape`.
- Rendimiento & Optimización de Búsqueda: Se implementó `debounce` (120-150ms) en la búsqueda del catálogo y panel admin, evitando re-renderizados continuos del DOM en cada pulsación.
- Seguridad en Navegación Externa: `window.open` protegido con `noopener,noreferrer` en descargas y enlaces de WhatsApp/Gmail para prevenir tabnabbing.
- Robustez en Storage: `guardarCarritoEnStorage` y `guardarPedidosEnStorage` blindados con `try...catch` contra fallos de cuota o navegación privada.
- Deep Linking & Navegación SPA: Integrado hash routing (`#producto-:id`, `#carrito`, `#admin`). Enlaces con semántica `href="#producto-${id}"` en lugar del anti-patrón `href="#"`.
- Contención Mobile en Detalle de Molde: Resuelto el desborde horizontal en pantallas estrechas (<= 400px) con `minmax(0, 1fr)`.
- Seguridad Backend & Pasarela: `marcar_pedido_completado_mp` y serverless `api/verificar-pago.js` activos.

## Decisiones y por qué
- 10% OFF en Transferencia Bancaria: Incentiva el pago directo sin comisiones de pasarelas, calculando el importe final de forma transparente en el checkout (`Math.round(total * 0.90 * 100) / 100`) y desglosando subtotal y descuento.
- Debounce en inputs en vivo: Mantiene la reactividad visual inmediata en los controles de limpieza ('✕') mientras aplaza el re-renderizado pesado de cards e iconos Lucide.

## Aprendizajes y errores a evitar
- Al calcular descuentos porcentuales en moneda local, redondear siempre a 2 decimales para evitar discrepancias por coma flotante en JavaScript.
- Los botones sin atributo `type` adoptan `type="submit"` por defecto; siempre especificar `type="button"` fuera de formularios de envío.
- Nunca usar `href="#"` para acciones SPA que tengan ruta canónica (`#producto-X`).
