# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 25/11/2026 — Corrección de 404 en env.js, CSP de unpkg y soporte integral para retorno in_process de MP.

## Estado actual
- Retorno Robusto de Mercado Pago: `procesarRetornoMercadoPago()` y `api/verificar-pago.js` soportan estados `approved`, `pending` e `in_process`, mostrando el modal de pedido con código de orden y mensaje descriptivo de acreditación.
- Corrección 404 `env.js`: Inyección dinámica condicional de `js/env.js` solo en localhost, eliminando errores de tipo MIME y 404 en Vercel.
- CSP Sourcemaps Unpkg: Se agregó `https://unpkg.com` a la directiva `connect-src` en `vercel.json`.
- Avisos de Entrega Exclusiva por Email: Integrado cuadro de advertencia en checkout (`.checkout-email-warning-box`) abajo de inputs de cliente, y bloque destacado en confirmación de pedido (`.alert-entrega-email`) aclarando plazos y ausencia de envíos por WhatsApp/Instagram.
- Textarea en Descripción de Moldes: Reemplazado el input plano por `<textarea id="producto-descripcion" rows="5">` con soporte gramatical y `white-space: pre-line;`.
- Precios en ARS sin centavos: `formatearPrecio()` redondea incondicionalmente a enteros con protección contra `-0`.
- Sanitización en Admin e Ingesta: `guardarProducto()` y los inputs HTML (`step="1"`) fuerzan números enteros en ARS.
- Normalización en Backend MP & Supabase: `api/crear-preferencia.js` y `supabaseGuardarProducto()` redondean unit_price y precios oficiales a enteros.
- Cache Busting & Despliegue en Vercel: Parámetros de versión `?v=2.4` en `index.html` y regla `Cache-Control: public, max-age=0, must-revalidate` en `vercel.json` para assets y HTML.
- SQL Migración Supabase: Agregado script `UPDATE public.productos SET precio = ROUND(precio), precio_promo = ROUND(...)` en `sql/supabase-schema.sql`.
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
