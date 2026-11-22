# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 22/11/2026 — Deep linking para vistas de producto y corrección de desbordes en mobile.

## Estado actual
- Deep Linking & Navegación SPA: Integrado hash routing (`#producto-:id`, `#carrito`, `#admin`). Al recargar la página en un molde o usar Atrás/Adelante en el navegador, se preserva y restaura la vista automáticamente.
- Contención Mobile en Detalle de Molde: Resuelto el desborde horizontal en pantallas estrechas (<= 400px). Se aplicó `minmax(0, 1fr)` a columnas de grid, `min-width: 0`, `overflow-wrap: break-word`, miniaturas carrusel compactas (48px) con scroll táctil y `justify-content: safe center`.
- Vista Producto: Retiradas las cajas fijas de "Detalles y Especificaciones" e "Impresión fácil en casa", dejando la ficha enfocada en la descripción real, precio y compra.
- Catálogo Admin Moderno: Lista de tarjetas de inventario (`.admin-inventory-item`) con thumbnails 52x52, chips de categoría, badges de promo/gratis, precios e indicadores de PDF/video, evitando desbordes.
- Seguridad y Vulnerabilidades:
  - SQL: `marcar_pedido_completado_mp` revocado a `anon`; `registrar_pedido_checkout` fuerza estado 'pendiente'.
  - Storage: Política RLS en `moldes-archivos` actualizada para permitir signed URLs a pedidos con `estado = 'completada'` o moldes gratuitos.
  - Mercado Pago: Endpoint serverless `api/verificar-pago.js` que valida cobros con la API oficial antes de aprobar pedidos.
- Responsive Mobile & UI: Botón de carrito con icono `shopping-cart` + badge. Elementos centrados en mobile. Fotos 1:1.

## Decisiones y por qué
- URL Hash para estado SPA (`history.pushState`): Permite que Giu o clientes compartan enlaces directos a un molde específico y que al refrescar la web no se vuelva al inicio, sin necesidad de configuración de rutas en el servidor.
- `minmax(0, 1fr)` y `min-width: 0` en Grid CSS: Esencial para evitar que elementos con min-content ancho (como carruseles de fotos) fuercen el ancho de la columna fuera de la pantalla en dispositivos móviles.

## Aprendizajes y errores a evitar
- `justify-content: center` con `overflow-x: auto` en Flexbox puede causar "scroll clipping" irrecuperable a la izquierda; usar `justify-content: safe center` o alinear a `flex-start` en mobile.
- En CSS Grid, `1fr` equivale a `minmax(auto, 1fr)` por especificación; para permitir que los hijos se encojan se debe usar `minmax(0, 1fr)`.
- Los atributos inline `onclick="..."` decodifican entidades HTML (`&#39;`) antes de evaluar JavaScript. Invocar siempre funciones pasando IDs limpios.
