# Guía del Proyecto y Reglas para Agentes (AGENTS.md)

Bienvenido al repositorio de **Tienda de Moldes Digitales - Ecommerce MVP**. Este documento define la arquitectura, las directrices de diseño, las convenciones de código y las instrucciones de trabajo para asistentes y agentes de inteligencia artificial (Antigravity/Gemini).

---

## 1. Visión General del Proyecto

- **Nombre:** Tienda de Moldes Digitales (Moldes & Costura).
- **Tipo:** MVP de Comercio Electrónico tipo Single Page Application (SPA).
- **Propósito:** Catálogo digital de patrones de costura y moldería descargable en formato PDF, con carrito de compras, checkout guiado por transferencia bancaria y un panel de administración para gestión de productos y precios promocionales.
- **Enfoque técnico:** Código pedagógico, limpio, sin dependencias externas ni procesos de compilación (Vanilla Web Stack).

---

## 2. Pila Tecnológica (Tech Stack)

| Componente | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Estructura** | HTML5 Semántico | SPA con navegación mediante renderizado condicional de secciones. |
| **Estilos** | CSS3 Vanilla | Tokens de diseño mediante variables CSS (`:root`), Flexbox, CSS Grid y diseño responsivo. |
| **Lógica** | JavaScript (ES6+) | Manipulación del DOM nativa, arquitectura basada en eventos y renderizado reactivo manual. |
| **Persistencia** | Web Storage API (`localStorage` y `sessionStorage`) | Catálogo, carrito y pedidos en `localStorage`. Sesión del panel admin en `sessionStorage` (`cose_admin_auth`). |

> **Importante:** Salvo que el usuario lo solicite expresamente, **no** agregar frameworks pesados (React, Vue, Angular) ni frameworks CSS con compilación (Tailwind CSS, Bootstrap). El proyecto debe mantenerse ejecutable directamente desde el navegador.

---

## 3. Estructura de Archivos

```plaintext
Tienda de moldes/
├── index.html       # Estructura principal, vistas (catálogo, detalle producto, carrito, admin) y modal de checkout
├── styles.css       # Sistema de diseño con paleta Cosé con Giu, tarjetas expandibles, badges y toolbar
├── app.js           # Lógica de negocio, CRUD de productos, filtros de fecha/texto, pedidos y vista de producto
├── logo.png         # Logo original de Cosé con Giu
├── logo-cropped.png # Logo optimizado y recortado para el encabezado
├── favicon.png      # Favicon cuadrado optimizado
├── commands/        # Comandos slash personalizados ejecutables por el agente (ej. commands/feature.md)
├── MEMORY.md        # Memoria del proyecto entre sesiones
└── AGENTS.md        # Guía de contexto y reglas para agentes de desarrollo
```

### Detalle de Componentes Clave

1. **`index.html`**:
   - Header con branding oficial "Cosé con Giu", logo responsivo y contador de carrito (`#cart-badge`).
   - `#view-catalogo`: Grid responsivo donde se muestran las tarjetas ampliadas de los moldes con íconos destacados, barra de herramientas con buscador en vivo (`#catalogo-busqueda`), chips de categorías dinámicos (`#categoria-chips`), selector de ordenamiento (`#catalogo-orden`) e insignia dinámica de "⭐ Más Vendido".
   - `#view-producto`: Vista detallada de un molde individual (`#producto-detalle-contenedor`) con especificaciones, estado de oferta y botón de compra directa.
   - `#view-carrito`: Resumen de pedidos, selector de cantidades y botón de checkout.
   - `#view-admin-login`: Formulario de acceso al panel (`#form-admin-login`). Credenciales demo: usuario `admin`, contraseña `giu2026`.
   - `#view-admin`:
     - Tarjetas métricas superiores: *Producto Más Vendido*, *Total de Pedidos* e *Ingresos Confirmados*.
     - Buscador global admin (`#admin-busqueda`) y filtro por fecha dual (`#filtro-pedidos-fecha-rapida` + `#filtro-pedidos-fecha-input`).
     - Listado de ventas en tarjetas expandibles tipo acordeón (`#lista-admin-pedidos`) con código de color en el borde izquierdo según estado (`pendiente`: ámbar, `completada`: verde, `cancelada`: rojo) y botón de entrega de archivos de Google Drive y video tutorial por email (`.btn-action-send-files`), con estado deshabilitado tras el envío y opción de reenvío.
     - Formulario de alta/edición de moldes con campos para `producto-link-archivos` (Google Drive), `producto-link-video` (YouTube/Drive), campo de categoría y tabla de gestión del catálogo con nombres clickeables hacia `#view-producto`.
     - Botón `.btn-logout-admin` via `cerrarSesionAdmin()`.
   - `#modal-checkout`: Ventana modal que captura los datos del comprador (*Nombre*, correo **solo @gmail.com**, *WhatsApp*) antes de confirmar la transferencia. El molde se entrega después, a mano, con un enlace de Google Drive.
   - `#toast`: Notificaciones emergentes para retroalimentación visual al usuario.

2. **`styles.css`**:
   - Variables CSS globales `:root` basadas en el logo oficial:
     - Primario y variantes: `--primary: #845ec2`, `--primary-hover: #7047a3`, `--primary-dark: #583387`, `--primary-soft: #f4ecfd`.
     - Acento dorado aguja: `--accent-gold: #c7a138`, `--accent-gold-soft: #fef9e8`, `--accent-gold-border: #f6e3a4`.
     - Fondo de página: `--bg-page: #faf7fd`, texto principal: `--text-main: #251b33`.
   - Badges de estado de pedido: `.badge-estado.pendiente`, `.badge-estado.completada`, `.badge-estado.cancelada`.
   - Badges de producto: `.product-badge-bestseller` (dorado) y `.product-badge-promo` (fucsia).
   - Componentes v3: `.order-expandable-card` (bordes coloreados por estado y cabecera interactiva), `.category-chip` (estados activo/inactivo), `.product-detail-card` y `.product-icon-wrap` (gradientes vectoriales).

3. **`app.js`**:
   - `PRODUCTOS_POR_DEFECTO` / `PEDIDOS_POR_DEFECTO`: Moldes iniciales con atributos `categoria`, `linkArchivos`, `linkVideo` y pedidos de muestra con `archivosEnviados` y `fechaEnvioArchivos`.
   - Estado de filtrado: `filtrosCatalogo` (búsqueda, categoría, orden) y `filtrosAdmin` (texto, fecha).
   - `pedidosExpandidos`: Conjunto `Set` que mantiene el estado de despliegue de las tarjetas de pedidos.
   - Navegación SPA: `cambiarVista('catalogo' | 'producto' | 'carrito' | 'admin')` y `verDetalleProducto(id)`. `cambiarVista('admin')` muestra `#view-admin-login` si no hay sesión.
   - Sesión admin (candado de UI): `estaAdminLogueado()`, `iniciarSesionAdmin()`, `cerrarSesionAdmin()` con flag `{ logueado: true }` en `sessionStorage`.
   - Panel de administración: `renderMetricasAdmin()`, `renderPedidosAdmin()`, `cambiarEstadoPedido(id, nuevoEstado)`, `eliminarPedido(id)`.
   - Entrega digital: `generarEnlaceCorreoEntrega(pedido)`, `enviarArchivosPedido(id)` y `reenviarArchivosPedido(id)` con apertura inteligente de Gmail Web Compose y fallback `mailto:`.
   - Checkout con captura de cliente: `confirmarPedido()` exige `esCorreoGmail()` (dominio exacto `gmail.com`) y crea un snapshot histórico de la orden con enlaces digitales.
   - Utilidades defensivas: `escaparHTML()` (prevención de XSS) y `formatearPrecio()` (formato numérico regional).

---

## 4. Convenciones de Desarrollo y Código

### 4.1. Nombres y Estilo
- **Idioma:** Todo el código (variables, funciones, comentarios, mensajes al usuario) debe estar en **español**.
- **Variables y funciones:** Usar `camelCase` descriptivo (ej. `agregarAlCarrito`, `precioFinal`, `productoExistente`).
- **Constantes:** Usar `SCREAMING_SNAKE_CASE` (ej. `STORAGE_PRODUCTOS`, `PRODUCTOS_POR_DEFECTO`).
- **Clases CSS:** Usar `kebab-case` semántico (ej. `product-card`, `btn-primary`, `cart-empty`).
- **IDs de elementos:** Usar `kebab-case` claro para selección desde JavaScript (ej. `view-catalogo`, `cart-badge`).

### 4.2. Buenas Prácticas y Seguridad
- **Sanitización Obligatoria:** Toda información inyectada mediante `innerHTML` que provenga de entradas del usuario o del formulario debe pasar por `escaparHTML(texto)` para evitar vulnerabilidades XSS.
- **Sincronización con Storage:** Siempre que se mute el arreglo `productos` o `carrito`, invocar inmediatamente `guardarProductosEnStorage()` o `guardarCarritoEnStorage()`.
- **Manejo Defensivo del DOM:** Comprobar la existencia del elemento antes de manipularlo (ej. `if (!catalogoGrid) return;`).
- **Comentarios Educativos:** Mantener y añadir comentarios claros y didácticos que expliquen el flujo de la lógica para facilitar el aprendizaje.

---

## 5. Instrucciones Específicas para Agentes de IA

Cuando un agente interactúe con este repositorio, debe acatar las siguientes reglas:

1. **Flujo de comandos slash (`/nombre`):** Cuando el usuario envíe un comando que inicie con una barra diagonal (ej. `/feature`, `/refactor`), el agente debe buscar el archivo `commands/<nombre>.md`, leer sus requerimientos y ejecutar el plan o las instrucciones descritas en él.
2. **Mantener la simplicidad:** Evitar sobreingeniería. Si se agrega una nueva funcionalidad (por ejemplo, filtros por categoría o búsqueda por nombre), implementarla en Vanilla JS y CSS respetando el patrón existente.
3. **Preservar la consistencia estética:** Usar las variables definidas en `:root` de `styles.css`. No introducir colores aleatorios fuera de la paleta ya configurada.
4. **No romper la compatibilidad local:** La aplicación debe funcionar abriendo directamente el archivo [index.html](file:///d:/Exe/archivos/PROYECTOS/Tienda%20de%20moldes/index.html) en cualquier navegador moderno o mediante un servidor estático simple (`npx serve`, etc.).
5. **Verificación visual y de enlaces:** Toda referencia a archivos locales en respuestas o documentación debe utilizar enlaces Markdown válidos con formato `[nombre](file:///ruta/completa)`.
6. **No eliminar datos por defecto sin alternativa:** Las opciones de prueba como `restablecerCatalogoDefecto` y `restablecerPedidosDefecto` deben seguir funcionando para permitir pruebas rápidas en el navegador.

---

## 6. Hoja de Ruta / Posibles Extensiones Futuras

Si el usuario solicita ampliar la aplicación, las siguientes son extensiones naturales preparadas para esta base:
- **Buscador y filtros:** Filtrado por categoría (vestidos, pantalones, bolsos, principiantes/avanzado).
- **Integración con WhatsApp:** Botón en el checkout para enviar el comprobante directamente con un mensaje pre-armado con el detalle del pedido.
- **Carga de imágenes reales:** Permitir subir URLs de fotos o base64 para los moldes en lugar de emojis.
- **Descarga simulada:** Botón para descargar un archivo PDF de muestra tras confirmar la compra.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de
dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales). 

## Límites
- ✅ Siempre: respetar las reglas del carrito de compras, el formulario de compra, el formulario de admin, el modal de checkout, el formulario del modal de checkout, el navbar, el footer, mantener los textos en español.
- ⚠️ Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados.
- 🚫 Nunca: añadir dependencias, frameworks o un paso de build. 
- ✅ Siempre: actualizar MEMORY.md al terminar cada tarea.

## Verificación
- No hay tests ni lint. Probar abriendo `index.html` en el navegador.
- Para empezar de cero: DevTools → Application → Local Storage → borrar la clave
`Tienda de Moldes Digitales - Ecommerce MVP`
