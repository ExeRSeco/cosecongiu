# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 23/11/2026 — Redondeo entero sin centavos para descuento con Transferencia y formateo ARS.

## Estado actual
- Descuento 10% OFF con Transferencia: Calculado con redondeo a números enteros (`Math.round(... * 0.90)`) y presentado sin centavos (`$3.500` o `$3.990` en vez de `$3.500,10` o `$3.500,00`) en catálogo, vista detalle, checkout y pedido registrado.
- Formateo de Precios ARS: `formatearPrecio()` adaptado para no emitir `,00` en números enteros, preservando decimales solo si existen fracciones reales.
- Accesibilidad (WCAG) & Semántica: Se añadieron `type="button"` explícitos a todos los botones modales/navegación, `aria-label` descriptivos a inputs de búsqueda y filtros, y soporte para cerrar cualquier modal con la tecla `Escape`.
- Rendimiento & Optimización de Búsqueda: Se implementó `debounce` (120-150ms) en la búsqueda del catálogo y panel admin, evitando re-renderizados continuos del DOM en cada pulsación.
- Seguridad en Navegación Externa: `window.open` protegido con `noopener,noreferrer` en descargas y enlaces de WhatsApp/Gmail para prevenir tabnabbing.
- Robustez en Storage: `guardarCarritoEnStorage` y `guardarPedidosEnStorage` blindados con `try...catch` contra fallos de cuota o navegación privada.
- Deep Linking & Navegación SPA: Integrado hash routing (`#producto-:id`, `#carrito`, `#admin`). Enlaces con semántica `href="#producto-${id}"` en lugar del anti-patrón `href="#"`.
- Contención Mobile en Detalle de Molde: Resuelto el desborde horizontal en pantallas estrechas (<= 400px) con `minmax(0, 1fr)`.
- Seguridad Backend & Pasarela: `marcar_pedido_completado_mp` y serverless `api/verificar-pago.js` activos.

## Decisiones y por qué
- Precios ARS sin centavos: En comercio electrónico argentino (ARS), los centavos no circulan ni se utilizan en transferencias bancarias. Redondear a enteros con `Math.round(precio * 0.90)` evita importes con decimales extraños (`$3.500,10` o `$3.990,20`).
- 10% OFF en Transferencia Bancaria: Incentiva el pago directo sin comisiones de pasarelas, calculando el importe final de forma transparente en el checkout y desglosando subtotal y descuento.
- Debounce en inputs en vivo: Mantiene la reactividad visual inmediata en los controles de limpieza ('✕') mientras aplaza el re-renderizado pesado de cards e iconos Lucide.

## Aprendizajes y errores a evitar
- Los precios con descuento porcentual en ARS deben redondearse al entero más cercano (`Math.round(...)`), evitando decimales como `,10` o `,20`.
- Los botones sin atributo `type` adoptan `type="submit"` por defecto; siempre especificar `type="button"` fuera de formularios de envío.
- Nunca usar `href="#"` para acciones SPA que tengan ruta canónica (`#producto-X`).
