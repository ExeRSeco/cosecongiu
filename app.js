/**
 * ====================================================================
 * TIENDA DE MOLDES DIGITALES - ECOMERCE MVP
 * Código simple, claro y comentado para aprender JavaScript paso a paso.
 * ====================================================================
 */

// 1. DATOS INICIALES POR DEFECTO
// Estos moldes se cargarán automáticamente la primera vez que abras la web.
const PRODUCTOS_POR_DEFECTO = [
  {
    id: 1,
    nombre: "Molde Vestido Solero Verano (PDF)",
    descripcion: "Patrón descargable en talles XS al XXL con guía de confección paso a paso.",
    categoria: "Vestidos",
    precio: 2500,
    enPromo: true,
    precioPromo: 1800,
    icono: "scissors",
    imagen: null,
    linkArchivos: "https://drive.google.com/drive/folders/1SoleroVerano_PDF_Drive",
    linkVideo: "https://www.youtube.com/watch?v=tutorial-vestido-solero"
  },
  {
    id: 2,
    nombre: "Molde Pantalón Palazzo con Cintura Elástica",
    descripcion: "Corte holgado y cómodo, incluye instrucciones de corte y tabla de medidas.",
    categoria: "Pantalones",
    precio: 2200,
    enPromo: false,
    precioPromo: 0,
    icono: "layers",
    imagen: null,
    linkArchivos: "https://drive.google.com/drive/folders/1Palazzo_Elastic_PDF_Drive",
    linkVideo: "https://www.youtube.com/watch?v=tutorial-pantalon-palazzo"
  },
  {
    id: 3,
    nombre: "Molde Camisa Oversize Cuello Clásico",
    descripcion: "Modelo unisex versátil en formato A4 listo para imprimir y pliego completo.",
    categoria: "Camisas",
    precio: 2900,
    enPromo: true,
    precioPromo: 2400,
    icono: "shirt",
    imagen: null,
    linkArchivos: "https://drive.google.com/drive/folders/1CamisaOversize_PDF_Drive",
    linkVideo: "https://www.youtube.com/watch?v=tutorial-camisa-oversize"
  },
  {
    id: 4,
    nombre: "Molde Bolso Tote Bag y Neceser",
    descripcion: "Ideal para principiantes en costura. Moldería paso a paso con forro interno.",
    categoria: "Bolsos y Accesorios",
    precio: 1500,
    enPromo: false,
    precioPromo: 0,
    icono: "shopping-bag",
    imagen: null,
    linkArchivos: "https://drive.google.com/drive/folders/1ToteBag_Neceser_PDF_Drive",
    linkVideo: "https://www.youtube.com/watch?v=tutorial-totebag-neceser"
  }
];

// Pedidos iniciales de demostración para pruebas inmediatas
const PEDIDOS_POR_DEFECTO = [
  {
    id: 1713001,
    codigo: "ORD-7821",
    fecha: "14/10/2026, 11:30",
    cliente: {
      nombre: "Lucía Fernández",
      email: "lucia.costura@gmail.com",
      telefono: "+54 9 11 4455-8899"
    },
    items: [
      { id: 1, nombre: "Molde Vestido Solero Verano (PDF)", precio: 1800, cantidad: 2, linkArchivos: "https://drive.google.com/drive/folders/1SoleroVerano_PDF_Drive", linkVideo: "https://www.youtube.com/watch?v=tutorial-vestido-solero" },
      { id: 4, nombre: "Molde Bolso Tote Bag y Neceser", precio: 1500, cantidad: 1, linkArchivos: "https://drive.google.com/drive/folders/1ToteBag_Neceser_PDF_Drive", linkVideo: "https://www.youtube.com/watch?v=tutorial-totebag-neceser" }
    ],
    total: 5100,
    estado: "completada", // "pendiente" | "completada" | "cancelada"
    archivosEnviados: true,
    fechaEnvioArchivos: "14/10/2026, 12:05"
  },
  {
    id: 1713002,
    codigo: "ORD-9104",
    fecha: "15/10/2026, 09:15",
    cliente: {
      nombre: "Martina Rossi",
      email: "mrossi.telas@gmail.com",
      telefono: "+54 9 341 556-7788"
    },
    items: [
      { id: 1, nombre: "Molde Vestido Solero Verano (PDF)", precio: 1800, cantidad: 1, linkArchivos: "https://drive.google.com/drive/folders/1SoleroVerano_PDF_Drive", linkVideo: "https://www.youtube.com/watch?v=tutorial-vestido-solero" },
      { id: 3, nombre: "Molde Camisa Oversize Cuello Clásico", precio: 2400, cantidad: 1, linkArchivos: "https://drive.google.com/drive/folders/1CamisaOversize_PDF_Drive", linkVideo: "https://www.youtube.com/watch?v=tutorial-camisa-oversize" }
    ],
    total: 4200,
    estado: "completada",
    archivosEnviados: false,
    fechaEnvioArchivos: null
  },
  {
    id: 1713003,
    codigo: "ORD-3450",
    fecha: "15/10/2026, 13:40",
    cliente: {
      nombre: "Camila Benítez",
      email: "camilab.costura@gmail.com",
      telefono: "+54 9 11 6789-0123"
    },
    items: [
      { id: 2, nombre: "Molde Pantalón Palazzo con Cintura Elástica", precio: 2200, cantidad: 1, linkArchivos: "https://drive.google.com/drive/folders/1Palazzo_Elastic_PDF_Drive", linkVideo: "https://www.youtube.com/watch?v=tutorial-pantalon-palazzo" }
    ],
    total: 2200,
    estado: "pendiente",
    archivosEnviados: false,
    fechaEnvioArchivos: null
  }
];

// Enlaces de respaldo generales para la entrega digital
const ENLACE_DRIVE_GENERAL = "https://drive.google.com/drive/folders/1CoseConGiu_MoldesPDF_Oficial";
const ENLACE_VIDEO_GENERAL = "https://www.youtube.com/watch?v=tutorial-cose-con-giu";

// Claves utilizadas para guardar en el almacenamiento del navegador (localStorage y sessionStorage)
const STORAGE_PRODUCTOS = "tienda_moldes_productos";
const STORAGE_CARRITO = "tienda_moldes_carrito";
const STORAGE_PEDIDOS = "tienda_moldes_pedidos";
const STORAGE_ADMIN_AUTH = "cose_admin_auth";

// Credenciales de demostración del panel (candado de UI, no es un backend real)
const ADMIN_USUARIO = "admin";
const ADMIN_PASSWORD = "giu2026";

/**
 * ====================================================================
 * UTILIDADES DE FECHAS LOCALES (Reglas de la skill local-dates)
 * ====================================================================
 */
function obtenerFechaLocalTexto(d = new Date()) {
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${dia}/${mes}/${anio}`;
}

function obtenerFechaLocalHoraTexto(d = new Date()) {
  const fechaStr = obtenerFechaLocalTexto(d);
  const hora = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${fechaStr}, ${hora}:${min}`;
}

/**
 * ====================================================================
 * UTILIDADES DE ICONOS VECTORIALES (LUCIDE ICONS)
 * ====================================================================
 */
function actualizarIconosLucide() {
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

function renderIconoMolde(icono, clase = "") {
  const mapa = {
    "👗": "scissors",
    "👖": "layers",
    "👔": "shirt",
    "👜": "shopping-bag",
    "🧵": "scissors",
    "📄": "file-text",
    "scissors": "scissors",
    "shirt": "shirt",
    "shopping-bag": "shopping-bag",
    "file-text": "file-text",
    "sparkles": "sparkles",
    "layers": "layers"
  };
  const iconoLucide = mapa[icono] || (icono && icono.length > 2 ? icono : "scissors");
  return `<i data-lucide="${iconoLucide}" class="${clase}"></i>`;
}

// Variables globales del estado de nuestra tienda
let productos = [];
let carrito = [];
let pedidos = [];

// Estados de filtrado y búsqueda reactiva
let filtrosCatalogo = {
  busqueda: "",
  categoria: "todas",
  orden: "defecto" // "defecto", "precio-menor", "precio-mayor", "nombre"
};

let filtrosAdmin = {
  busqueda: "",
  estado: "todos",
  fechaRapida: "todas",
  fechaEspecifica: ""
};

// Conjunto para controlar qué pedidos están expandidos en la lista de ventas
let pedidosExpandidos = new Set();

/**
 * ====================================================================
 * INICIALIZACIÓN
 * ====================================================================
 */
document.addEventListener("DOMContentLoaded", () => {
  cargarDatosDesdeLocalStorage();
  renderCategoriasChips();
  renderCatalogo();
  renderCarrito();
  renderAdmin();
  actualizarContadorCarrito();
  actualizarIconosLucide();
  actualizarBadgeSupabaseUI();

  // Sincronización transparente con base de datos Supabase en segundo plano
  sincronizarConSupabaseSiAplica();

  // Mostrar vista previa de imagen al seleccionar un archivo en el formulario admin
  const inputImagen = document.getElementById('producto-imagen');
  if (inputImagen) {
    inputImagen.addEventListener('change', function() {
      const file = this.files && this.files[0];
      const previewWrap = document.getElementById('producto-preview-wrap');
      const previewImg = document.getElementById('producto-preview');
      if (file && previewImg && previewWrap) {
        const reader = new FileReader();
        reader.onload = function(e) {
          previewImg.src = e.target.result;
          previewWrap.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else if (previewWrap && previewImg) {
        previewImg.src = '';
        previewWrap.style.display = 'none';
      }
    });
  }
});

/**
 * ====================================================================
 * SINCRONIZACIÓN Y ESTADO DE SUPABASE (PRODUCCIÓN)
 * ====================================================================
 */

/**
 * Actualiza la apariencia del botón de estado de Supabase en el panel admin y el modal
 */
function actualizarBadgeSupabaseUI(estadoForzado = null) {
  const dot = document.getElementById("status-dot-supabase");
  const texto = document.getElementById("texto-status-supabase");
  const modalDot = document.getElementById("modal-status-dot");
  const modalText = document.getElementById("modal-status-text");
  const modalBanner = document.getElementById("supabase-status-banner");

  const configurado = typeof estaSupabaseConfigurado === "function" && estaSupabaseConfigurado();
  const estado = estadoForzado || (configurado ? "online" : "local");

  if (dot) {
    dot.className = `status-dot-supabase ${estado === 'online' ? 'online' : (estado === 'error' ? 'offline' : '')}`;
  }

  if (texto) {
    if (estado === "online") {
      texto.textContent = "Supabase Conectado";
    } else if (estado === "error") {
      texto.textContent = "Error de Conexión";
    } else {
      texto.textContent = "Modo Local (Respaldo)";
    }
  }

  if (modalDot) {
    modalDot.className = `status-dot-supabase ${estado === 'online' ? 'online' : (estado === 'error' ? 'offline' : '')}`;
  }

  if (modalText && modalBanner) {
    if (estado === "online") {
      modalBanner.className = "supabase-status-banner online";
      modalText.textContent = "Conectado a Supabase (PostgreSQL en la Nube)";
    } else if (estado === "error") {
      modalBanner.className = "supabase-status-banner error";
      modalText.textContent = "Error al conectar con Supabase (revisa claves)";
    } else {
      modalBanner.className = "supabase-status-banner local";
      modalText.textContent = "Modo Local Activo (almacenamiento en este navegador)";
    }
  }
}

/**
 * Consulta los datos en Supabase al abrir la aplicación si está configurado
 */
async function sincronizarConSupabaseSiAplica() {
  if (typeof estaSupabaseConfigurado !== "function" || !estaSupabaseConfigurado()) {
    actualizarBadgeSupabaseUI("local");
    return;
  }

  try {
    actualizarBadgeSupabaseUI("online");

    // 1. Obtener catálogo desde Supabase
    if (typeof supabaseObtenerProductos === "function") {
      const productosRemotos = await supabaseObtenerProductos();
      if (Array.isArray(productosRemotos) && productosRemotos.length > 0) {
        productos = productosRemotos;
        guardarProductosEnStorage();
        renderCategoriasChips();
        renderCatalogo();
        renderCatalogoAdmin();
      }
    }

    // 2. Obtener pedidos desde Supabase
    if (typeof supabaseObtenerPedidos === "function") {
      const pedidosRemotos = await supabaseObtenerPedidos();
      if (Array.isArray(pedidosRemotos)) {
        pedidos = pedidosRemotos;
        guardarPedidosEnStorage();
        renderAdmin();
      }
    }

    actualizarBadgeSupabaseUI("online");
  } catch (err) {
    console.warn("[Supabase] No se pudo sincronizar en segundo plano:", err);
    actualizarBadgeSupabaseUI("error");
  }
}


/**
 * Carga los productos, el carrito y los pedidos guardados en localStorage.
 * Si es la primera vez, inicializa con los datos por defecto.
 */
function cargarDatosDesdeLocalStorage() {
  const productosGuardados = localStorage.getItem(STORAGE_PRODUCTOS);
  if (productosGuardados) {
    productos = JSON.parse(productosGuardados);
  } else {
    productos = [...PRODUCTOS_POR_DEFECTO];
    guardarProductosEnStorage();
  }

  const carritoGuardado = localStorage.getItem(STORAGE_CARRITO);
  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
  } else {
    carrito = [];
  }

  const pedidosGuardados = localStorage.getItem(STORAGE_PEDIDOS);
  if (pedidosGuardados) {
    pedidos = JSON.parse(pedidosGuardados);
  } else {
    pedidos = JSON.parse(JSON.stringify(PEDIDOS_POR_DEFECTO));
    guardarPedidosEnStorage();
  }
}

function guardarProductosEnStorage() {
  localStorage.setItem(STORAGE_PRODUCTOS, JSON.stringify(productos));
}

function guardarCarritoEnStorage() {
  localStorage.setItem(STORAGE_CARRITO, JSON.stringify(carrito));
}

function guardarPedidosEnStorage() {
  localStorage.setItem(STORAGE_PEDIDOS, JSON.stringify(pedidos));
}

/**
 * ====================================================================
 * SESIÓN DEL PANEL DE ADMINISTRACIÓN (sessionStorage)
 * Recargar la pestaña mantiene el acceso; cerrar la pestaña pide login.
 * ====================================================================
 */
function estaAdminLogueado() {
  try {
    const raw = sessionStorage.getItem(STORAGE_ADMIN_AUTH);
    if (!raw) return false;
    const datos = JSON.parse(raw);
    return Boolean(datos && datos.logueado);
  } catch (error) {
    return false;
  }
}

function guardarSesionAdmin() {
  sessionStorage.setItem(STORAGE_ADMIN_AUTH, JSON.stringify({ logueado: true }));
}

function borrarSesionAdmin() {
  sessionStorage.removeItem(STORAGE_ADMIN_AUTH);
}

function mostrarErrorLoginAdmin(mensaje) {
  const cajaError = document.getElementById("admin-login-error");
  if (!cajaError) return;
  cajaError.textContent = mensaje;
  cajaError.style.display = mensaje ? "block" : "none";
}

async function iniciarSesionAdmin() {
  const inputUsuario = document.getElementById("admin-login-usuario");
  const inputPassword = document.getElementById("admin-login-password");
  const usuario = inputUsuario ? inputUsuario.value.trim() : "";
  const password = inputPassword ? inputPassword.value.trim() : "";

  if (!usuario || !password) {
    mostrarErrorLoginAdmin("Por favor ingresa tu usuario y contraseña.");
    return;
  }

  // 1. Si Supabase está configurado y el usuario ingresa un correo, intentamos autenticación oficial
  if (typeof estaSupabaseConfigurado === "function" && estaSupabaseConfigurado() && usuario.includes("@")) {
    const resAuth = await supabaseIniciarSesion(usuario, password);
    if (resAuth && resAuth.exito) {
      guardarSesionAdmin();
      mostrarErrorLoginAdmin("");
      if (document.getElementById("form-admin-login")) {
        document.getElementById("form-admin-login").reset();
      }
      mostrarToast(`Sesión iniciada con Supabase Auth (${resAuth.usuario?.email || 'admin'}).`);
      cambiarVista("admin");
      return;
    }
  }

  // 2. Validación de respaldo con credenciales demo locales
  if (usuario !== ADMIN_USUARIO || password !== ADMIN_PASSWORD) {
    mostrarErrorLoginAdmin("Usuario o contraseña incorrectos. Revisa tus credenciales.");
    if (inputPassword) inputPassword.value = "";
    if (inputPassword) inputPassword.focus();
    return;
  }

  guardarSesionAdmin();
  mostrarErrorLoginAdmin("");
  if (document.getElementById("form-admin-login")) {
    document.getElementById("form-admin-login").reset();
  }
  mostrarToast("Sesión de administración iniciada.");
  cambiarVista("admin");
}

async function cerrarSesionAdmin() {
  if (typeof supabaseCerrarSesion === "function") {
    await supabaseCerrarSesion();
  }
  borrarSesionAdmin();
  mostrarErrorLoginAdmin("");
  mostrarToast("Sesión cerrada. Volvé a ingresar para gestionar ventas.");
  cambiarVista("admin");
}

/**
 * Calcula cuál es el producto más vendido de la tienda.
 * Se consideran únicamente compras en estado 'completada' (molde entregado).
 * Devuelve un objeto con datos del producto líder o null si no hay ventas.
 */
function obtenerProductoMasVendido() {
  const ventasMap = {}; // { [id]: { id, nombre, unidades: 0, total: 0 } }

  pedidos.forEach(pedido => {
    if (pedido.estado === "completada") {
      pedido.items.forEach(item => {
        if (!ventasMap[item.id]) {
          ventasMap[item.id] = {
            id: item.id,
            nombre: item.nombre,
            unidades: 0,
            total: 0
          };
        }
        ventasMap[item.id].unidades += Number(item.cantidad || 1);
        ventasMap[item.id].total += (Number(item.precio || 0) * Number(item.cantidad || 1));
      });
    }
  });

  const ids = Object.keys(ventasMap);
  if (ids.length === 0) return null;

  // Ordenar por unidades vendidas descendente; desempate por recaudación
  ids.sort((a, b) => {
    if (ventasMap[b].unidades !== ventasMap[a].unidades) {
      return ventasMap[b].unidades - ventasMap[a].unidades;
    }
    return ventasMap[b].total - ventasMap[a].total;
  });

  const topId = parseInt(ids[0], 10);
  const data = ventasMap[topId];
  const productoActual = productos.find(p => p.id === topId);

  return {
    id: topId,
    nombre: productoActual ? productoActual.nombre : data.nombre,
    unidades: data.unidades,
    total: data.total,
    icono: productoActual ? productoActual.icono : "scissors"
  };
}

/**
 * Calcula métricas globales de compras para el panel de administración.
 */
function calcularMetricasAdmin() {
  const topProducto = obtenerProductoMasVendido();
  const totalPedidos = pedidos.length;
  const completados = pedidos.filter(p => p.estado === "completada").length;
  const pendientes = pedidos.filter(p => p.estado === "pendiente").length;
  const cancelados = pedidos.filter(p => p.estado === "cancelada").length;
  const totalRecaudado = pedidos
    .filter(p => p.estado === "completada")
    .reduce((sum, p) => sum + (Number(p.total) || 0), 0);

  return {
    topProducto,
    totalPedidos,
    completados,
    pendientes,
    cancelados,
    totalRecaudado
  };
}

/**
 * ====================================================================
 * NAVEGACIÓN ENTRE VISTAS (Catálogo, Carrito, Admin)
 * ====================================================================
 */
function cambiarVista(vista) {
  // Ocultar todas las secciones (incluido el login de admin)
  document.getElementById("view-catalogo").style.display = "none";
  if (document.getElementById("view-producto")) {
    document.getElementById("view-producto").style.display = "none";
  }
  document.getElementById("view-carrito").style.display = "none";
  if (document.getElementById("view-admin-login")) {
    document.getElementById("view-admin-login").style.display = "none";
  }
  document.getElementById("view-admin").style.display = "none";

  // Remover clase activa de los botones
  document.getElementById("btn-nav-catalogo").classList.remove("active");
  document.getElementById("btn-nav-carrito").classList.remove("active");
  document.getElementById("btn-nav-admin").classList.remove("active");

  // Mostrar la sección seleccionada y activar su botón correspondiente
  if (vista === "catalogo") {
    document.getElementById("view-catalogo").style.display = "block";
    document.getElementById("btn-nav-catalogo").classList.add("active");
    renderCategoriasChips();
    renderCatalogo();
  } else if (vista === "producto") {
    if (document.getElementById("view-producto")) {
      document.getElementById("view-producto").style.display = "block";
    }
  } else if (vista === "carrito") {
    document.getElementById("view-carrito").style.display = "block";
    document.getElementById("btn-nav-carrito").classList.add("active");
    renderCarrito();
  } else if (vista === "admin") {
    document.getElementById("btn-nav-admin").classList.add("active");
    if (estaAdminLogueado()) {
      document.getElementById("view-admin").style.display = "block";
      renderAdmin();
    } else if (document.getElementById("view-admin-login")) {
      document.getElementById("view-admin-login").style.display = "block";
    }
  }

  // Scroll suave al inicio y actualización de iconos
  actualizarIconosLucide();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Muestra la vista dedicada con el detalle de un molde individual
 */
function verDetalleProducto(productoId) {
  const producto = productos.find(p => p.id === productoId);
  if (!producto) return;

  const contenedor = document.getElementById("producto-detalle-contenedor");
  if (!contenedor) return;

  const topProducto = obtenerProductoMasVendido();
  const esMasVendido = topProducto && topProducto.id === producto.id && topProducto.unidades > 0;
  const tieneDescuento = producto.enPromo && producto.precioPromo > 0;
  const precioFinal = tieneDescuento ? producto.precioPromo : producto.precio;

  contenedor.innerHTML = `
    <div class="product-detail-visual">
      ${esMasVendido ? '<span class="product-badge-bestseller" style="position: absolute; top: 1.25rem; left: 1.25rem;"><i data-lucide="sparkles" class="badge-icon"></i> Más Vendido</span>' : ''}
      ${tieneDescuento ? '<span class="product-badge-promo" style="position: absolute; top: 1.25rem; right: 1.25rem;"><i data-lucide="tag" class="badge-icon"></i> ¡Oferta!</span>' : ''}
      ${producto.imagen ? `<div class="product-image-wrap"><img src="${producto.imagen}" alt="${escaparHTML(producto.nombre)}"></div>` : `<div class="product-detail-icon">${renderIconoMolde(producto.icono)}</div>`}
      <span class="product-category-badge" style="font-size: 0.85rem; padding: 0.2rem 0.6rem; background: #ffffff; border-radius: 999px; border: 1px solid var(--border);">
        ${escaparHTML(producto.categoria || 'Moldería')}
      </span>
    </div>

    <div class="product-detail-info">
      <div class="product-detail-meta">
        <span class="badge" style="background: var(--primary-soft); color: var(--primary-dark); border: 1px solid var(--primary-border); font-size: 0.8rem; padding: 0.3rem 0.65rem;">
          <i data-lucide="file-text" class="ui-icon"></i> Patrón en PDF Descargable
        </span>
        <span class="badge" style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-size: 0.8rem; padding: 0.3rem 0.65rem;">
          <i data-lucide="zap" class="ui-icon"></i> Entrega Digital
        </span>
      </div>

      <h2 class="product-detail-title">${escaparHTML(producto.nombre)}</h2>
      <p class="product-detail-desc">${escaparHTML(producto.descripcion)}</p>

      <div class="product-detail-specs-box">
        <h4>Detalles y Especificaciones del Molde:</h4>
        <ul>
          <li><i data-lucide="file-text" class="ui-icon"></i> <strong>Formato:</strong> PDF A4 y Pliego A0</li>
          <li><i data-lucide="ruler" class="ui-icon"></i> <strong>Talles:</strong> XS, S, M, L, XL, XXL</li>
          <li><i data-lucide="scissors" class="ui-icon"></i> <strong>Márgenes:</strong> 1 cm incluidos</li>
          <li><i data-lucide="book-open" class="ui-icon"></i> <strong>Guía:</strong> Paso a paso de confección</li>
          <li><i data-lucide="video" class="ui-icon"></i> <strong>Video Tutorial:</strong> Confección guiada incluida</li>
        </ul>
      </div>

      <div class="product-price-box" style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
        ${tieneDescuento ? `
          <span class="price-promo" style="font-size: 1.9rem;">$${formatearPrecio(precioFinal)}</span>
          <span class="price-old" style="font-size: 1.15rem;">$${formatearPrecio(producto.precio)}</span>
        ` : `
          <span class="price-regular" style="font-size: 1.9rem;">$${formatearPrecio(precioFinal)}</span>
        `}
      </div>

      <div class="product-detail-actions">
        <button class="btn btn-primary" style="font-size: 1.05rem; padding: 0.85rem 1.75rem; flex: 1;" onclick="agregarAlCarrito(${producto.id})">
          <i data-lucide="shopping-bag" class="ui-icon"></i> Agregar al carrito
        </button>
        <button class="btn btn-secondary" style="font-size: 0.95rem; padding: 0.85rem 1.25rem;" onclick="cambiarVista('catalogo')">
          <i data-lucide="arrow-left" class="ui-icon"></i> Volver
        </button>
      </div>
    </div>
  `;

  actualizarIconosLucide();
  cambiarVista("producto");
}

/**
 * ====================================================================
 * 1. RENDERIZAR Y FILTRAR CATÁLOGO DE MOLDES
 * ====================================================================
 */
function renderCategoriasChips() {
  const contenedor = document.getElementById("categoria-chips");
  if (!contenedor) return;

  // Obtenemos lista única de categorías basada en los moldes registrados
  const categoriasSet = new Set(productos.map(p => p.categoria || "Otros"));
  const categorias = ["todas", ...Array.from(categoriasSet)];

  contenedor.innerHTML = categorias.map(cat => {
    const esActivo = filtrosCatalogo.categoria.toLowerCase() === cat.toLowerCase();
    // Limpieza de cualquier emoji o icono residual para un diseño tipográfico limpio
    const nombreLimpio = cat.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    const etiqueta = cat === "todas" ? "Todas las categorías" : (nombreLimpio || cat);
    return `
      <button type="button" class="category-chip ${esActivo ? 'active' : ''}" onclick="seleccionarCategoria('${escaparHTML(cat)}')">
        ${escaparHTML(etiqueta)}
      </button>
    `;
  }).join("");
}

function seleccionarCategoria(cat) {
  filtrosCatalogo.categoria = cat;
  renderCategoriasChips();
  renderCatalogo();
}

function filtrarCatalogoPorBusqueda(query) {
  filtrosCatalogo.busqueda = (query || "").trim().toLowerCase();
  const btnClear = document.getElementById("btn-clear-catalogo-search");
  if (btnClear) {
    btnClear.style.display = filtrosCatalogo.busqueda ? "flex" : "none";
  }
  renderCatalogo();
}

function limpiarBusquedaCatalogo() {
  const input = document.getElementById("catalogo-busqueda");
  if (input) input.value = "";
  filtrarCatalogoPorBusqueda("");
  if (input) input.focus();
}

function cambiarOrdenCatalogo(nuevoOrden) {
  filtrosCatalogo.orden = nuevoOrden;
  renderCatalogo();
}

function renderCatalogo() {
  const catalogoGrid = document.getElementById("catalogo-grid");
  const contadorEl = document.getElementById("catalogo-counter");
  if (!catalogoGrid) return;

  const topProducto = obtenerProductoMasVendido();

  // 1. Filtrado por texto (búsqueda en nombre y descripción)
  let listaFiltrada = productos.filter(producto => {
    if (!filtrosCatalogo.busqueda) return true;
    const nombreMatch = (producto.nombre || "").toLowerCase().includes(filtrosCatalogo.busqueda);
    const descMatch = (producto.descripcion || "").toLowerCase().includes(filtrosCatalogo.busqueda);
    const catMatch = (producto.categoria || "").toLowerCase().includes(filtrosCatalogo.busqueda);
    return nombreMatch || descMatch || catMatch;
  });

  // 2. Filtrado por categoría
  if (filtrosCatalogo.categoria && filtrosCatalogo.categoria !== "todas") {
    listaFiltrada = listaFiltrada.filter(producto => {
      return (producto.categoria || "Otros").toLowerCase() === filtrosCatalogo.categoria.toLowerCase();
    });
  }

  // 3. Ordenamiento
  listaFiltrada.sort((a, b) => {
    const precioA = a.enPromo && a.precioPromo > 0 ? a.precioPromo : a.precio;
    const precioB = b.enPromo && b.precioPromo > 0 ? b.precioPromo : b.precio;

    if (filtrosCatalogo.orden === "precio-menor") {
      return precioA - precioB;
    } else if (filtrosCatalogo.orden === "precio-mayor") {
      return precioB - precioA;
    } else if (filtrosCatalogo.orden === "nombre") {
      return a.nombre.localeCompare(b.nombre, "es");
    } else {
      // Orden por defecto: El Más Vendido primero, luego por ID
      const aEsTop = topProducto && topProducto.id === a.id;
      const bEsTop = topProducto && topProducto.id === b.id;
      if (aEsTop && !bEsTop) return -1;
      if (!aEsTop && bEsTop) return 1;
      return a.id - b.id;
    }
  });

  // Actualizar contador de resultados
  if (contadorEl) {
    if (listaFiltrada.length === productos.length) {
      contadorEl.textContent = `Mostrando todos los moldes (${productos.length})`;
    } else {
      contadorEl.textContent = `Mostrando ${listaFiltrada.length} de ${productos.length} moldes`;
    }
  }

  // Si no hay moldes que coincidan con la búsqueda o filtro
  if (listaFiltrada.length === 0) {
    catalogoGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: var(--bg-card); border-radius: var(--radius); border: 1px dashed var(--border);">
        <div style="margin-bottom: 0.6rem;"><i data-lucide="search-x" class="ui-icon-lg" style="color: var(--text-muted); width: 3rem; height: 3rem;"></i></div>
        <h3>No encontramos moldes con ese criterio</h3>
        <p style="color: var(--text-muted); margin: 0.5rem 0 1.25rem 0;">Prueba usando otras palabras o restableciendo los filtros de categoría.</p>
        <button class="btn btn-secondary btn-sm" onclick="limpiarBusquedaCatalogo(); seleccionarCategoria('todas');">
          <i data-lucide="rotate-ccw" class="ui-icon"></i> Restablecer búsqueda y filtros
        </button>
      </div>
    `;
    actualizarIconosLucide();
    return;
  }

  catalogoGrid.innerHTML = listaFiltrada.map(producto => {
    const precioFinal = producto.enPromo && producto.precioPromo > 0 ? producto.precioPromo : producto.precio;
    const tieneDescuento = producto.enPromo && producto.precioPromo > 0;
    const esMasVendido = topProducto && topProducto.id === producto.id && topProducto.unidades > 0;

    return `
      <article class="product-card ${esMasVendido ? 'card-bestseller' : ''}">
        <div class="product-badges-container">
          ${esMasVendido ? `<span class="product-badge-bestseller" title="¡El más vendido de la tienda con ${topProducto.unidades} compras entregadas!"><i data-lucide="sparkles" class="badge-icon"></i> Más Vendido (${topProducto.unidades})</span>` : ''}
          ${tieneDescuento ? '<span class="product-badge-promo"><i data-lucide="tag" class="badge-icon"></i> ¡Oferta!</span>' : ''}
        </div>
        
        ${producto.imagen ? `
        <div class="product-image-wrap" onclick="verDetalleProducto(${producto.id})" style="cursor: pointer;" title="Ver detalle del molde">
          <img src="${producto.imagen}" alt="${escaparHTML(producto.nombre)}">
        </div>
        ` : `
        <div class="product-icon-wrap" onclick="verDetalleProducto(${producto.id})" style="cursor: pointer;" title="Ver detalle del molde">
          ${renderIconoMolde(producto.icono)}
        </div>
        `}

        <span class="product-category-badge">${escaparHTML(producto.categoria || 'Moldería')}</span>

        <h3 class="product-title">
          <a href="#" class="product-title-link" onclick="verDetalleProducto(${producto.id}); return false;" title="Ver página y detalles de este molde">
            ${escaparHTML(producto.nombre)}
          </a>
        </h3>
        
        <p class="product-desc">${escaparHTML(producto.descripcion)}</p>

        <div class="product-price-box">
          ${tieneDescuento ? `
            <span class="price-promo">$${formatearPrecio(precioFinal)}</span>
            <span class="price-old">$${formatearPrecio(producto.precio)}</span>
          ` : `
            <span class="price-regular">$${formatearPrecio(precioFinal)}</span>
          `}
        </div>

        <button class="btn btn-primary btn-block" onclick="agregarAlCarrito(${producto.id})">
          <i data-lucide="shopping-bag" class="ui-icon"></i> Agregar al carrito
        </button>
      </article>
    `;
  }).join("");

  actualizarIconosLucide();
}

/**
 * ====================================================================
 * 2. FUNCIONES DEL CARRITO DE COMPRAS
 * ====================================================================
 */
function agregarAlCarrito(productoId) {
  const producto = productos.find(p => p.id === productoId);
  if (!producto) return;

  // Verificamos si ya está en el carrito
  const itemExistente = carrito.find(item => item.id === productoId);

  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    // Tomamos el precio vigente (promoción o regular)
    const precioEfectivo = producto.enPromo && producto.precioPromo > 0 ? producto.precioPromo : producto.precio;
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: precioEfectivo,
      cantidad: 1
    });
  }

  guardarCarritoEnStorage();
  actualizarContadorCarrito();
  mostrarToast(`"${producto.nombre}" se agregó al carrito.`);
}

function cambiarCantidad(productoId, cambio) {
  const item = carrito.find(p => p.id === productoId);
  if (!item) return;

  item.cantidad += cambio;

  if (item.cantidad <= 0) {
    eliminarDelCarrito(productoId);
    return;
  }

  guardarCarritoEnStorage();
  renderCarrito();
  actualizarContadorCarrito();
}

function eliminarDelCarrito(productoId) {
  carrito = carrito.filter(item => item.id !== productoId);
  guardarCarritoEnStorage();
  renderCarrito();
  actualizarContadorCarrito();
  mostrarToast("Molde eliminado del carrito.");
}

function calcularTotalCarrito() {
  return carrito.reduce((acumulado, item) => acumulado + (item.precio * item.cantidad), 0);
}

function calcularTotalCopias() {
  return carrito.reduce((acumulado, item) => acumulado + item.cantidad, 0);
}

function actualizarContadorCarrito() {
  const totalItems = calcularTotalCopias();
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.textContent = totalItems;
  }
}

function renderCarrito() {
  const contenedor = document.getElementById("carrito-contenedor");
  if (!contenedor) return;

  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon"><i data-lucide="shopping-bag" style="width: 3.5rem; height: 3.5rem; color: var(--primary);"></i></div>
        <h3>Tu carrito está vacío</h3>
        <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem 0;">No has seleccionado ningún molde todavía.</p>
        <button class="btn btn-primary" onclick="cambiarVista('catalogo')"><i data-lucide="scissors" class="ui-icon"></i> Ver Catálogo de Moldes</button>
      </div>
    `;
    actualizarIconosLucide();
    return;
  }

  const sumaTotal = calcularTotalCarrito();
  const totalCopias = calcularTotalCopias();

  contenedor.innerHTML = `
    <div class="cart-layout">
      <!-- Lista de artículos en el carrito -->
      <div class="card">
        <h3 style="margin-bottom: 1rem;"><i data-lucide="shopping-bag" class="ui-icon"></i> Moldes en tu pedido</h3>
        <div class="cart-items-list">
          ${carrito.map(item => `
            <div class="cart-item">
              <div class="cart-item-info">
                <div class="cart-item-title">${escaparHTML(item.nombre)}</div>
                <div class="cart-item-unit-price">Precio unitario: $${formatearPrecio(item.precio)}</div>
              </div>

              <!-- Control de cantidad de copias -->
              <div class="cart-item-qty">
                <button class="qty-btn" title="Restar una copia" onclick="cambiarCantidad(${item.id}, -1)">−</button>
                <span class="qty-value">${item.cantidad}</span>
                <button class="qty-btn" title="Sumar una copia" onclick="cambiarCantidad(${item.id}, 1)">+</button>
              </div>

              <!-- Subtotal por molde -->
              <div class="cart-item-subtotal">
                $${formatearPrecio(item.precio * item.cantidad)}
              </div>

              <!-- Botón para eliminar -->
              <button class="btn btn-danger btn-sm" title="Quitar molde" onclick="eliminarDelCarrito(${item.id})">
                <i data-lucide="trash-2" class="ui-icon"></i>
              </button>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Resumen y botón de finalizar compra -->
      <div class="cart-summary-box">
        <h3 class="summary-title">Resumen de Compra</h3>

        <div class="summary-row">
          <span>Total de copias/moldes:</span>
          <strong>${totalCopias}</strong>
        </div>

        <div class="summary-row">
          <span>Entrega:</span>
          <span style="color: var(--accent-green); font-weight: 600;">Descarga Digital Inmediata</span>
        </div>

        <div class="summary-total">
          <span>Suma total:</span>
          <span class="summary-total-monto">$${formatearPrecio(sumaTotal)}</span>
        </div>

        <button class="btn btn-success btn-block" style="margin-top: 1.25rem; font-size: 1.05rem;" onclick="abrirCheckout()">
          <i data-lucide="credit-card" class="ui-icon"></i> Finalizar Compra
        </button>

        <button class="btn btn-secondary btn-block btn-sm" style="margin-top: 0.6rem;" onclick="cambiarVista('catalogo')">
          <i data-lucide="arrow-left" class="ui-icon"></i> Continuar viendo moldes
        </button>
      </div>
    </div>
  `;

  actualizarIconosLucide();
}

/**
 * ====================================================================
 * 3. CHECKOUT SENCILLO (DATOS PARA TRANSFERENCIA)
 * ====================================================================
 */
function abrirCheckout() {
  if (carrito.length === 0) {
    mostrarToast("El carrito está vacío.");
    return;
  }

  const sumaTotal = calcularTotalCarrito();
  const resumenItemsTexto = carrito
    .map(item => `• ${escaparHTML(item.nombre)} (x${item.cantidad}) - $${formatearPrecio(item.precio * item.cantidad)}`)
    .join("<br>");

  document.getElementById("checkout-resumen-items").innerHTML = resumenItemsTexto;
  document.getElementById("checkout-total-monto").textContent = `$${formatearPrecio(sumaTotal)}`;

  // Mostramos el modal
  const modal = document.getElementById("modal-checkout");
  if (modal) {
    modal.style.display = "flex";
    modal.setAttribute('aria-hidden', 'false');
  }
  // Poner foco en el primer campo del formulario para accesibilidad
  const nombreInput = document.getElementById("cliente-nombre");
  if (nombreInput) nombreInput.focus();
}

function cerrarCheckout() {
  const modal = document.getElementById("modal-checkout");
  if (modal) {
    modal.style.display = "none";
    modal.setAttribute('aria-hidden', 'true');
  }
  // Devolver foco al botón del carrito
  const btnCarrito = document.getElementById('btn-nav-carrito');
  if (btnCarrito) btnCarrito.focus();
}

async function confirmarPedido() {
  const nombreInput = document.getElementById("cliente-nombre");
  const emailInput = document.getElementById("cliente-email");
  const telefonoInput = document.getElementById("cliente-telefono");

  const nombre = nombreInput ? nombreInput.value.trim() : "";
  const email = emailInput ? emailInput.value.trim() : "";
  const telefono = telefonoInput ? telefonoInput.value.trim() : "";

  if (!nombre) {
    mostrarToast("Por favor ingresa tu Nombre y Apellido para recibir los moldes.");
    if (nombreInput) nombreInput.focus();
    return;
  }

  if (!esCorreoGmail(email)) {
    mostrarToast("Usá un correo @gmail.com para enviarte el enlace de Drive.");
    if (emailInput) emailInput.focus();
    return;
  }

  const emailGmail = email.toLowerCase();

  if (carrito.length === 0) {
    mostrarToast("Tu carrito está vacío.");
    cerrarCheckout();
    return;
  }

  const sumaTotal = calcularTotalCarrito();
  const fechaActual = obtenerFechaLocalHoraTexto(new Date());

  // Creamos el nuevo pedido con snapshot de items y estado pendiente
  const nuevoPedido = {
    id: Date.now(),
    codigo: "ORD-" + Math.floor(1000 + Math.random() * 9000),
    fecha: fechaActual,
    cliente: {
      nombre: nombre,
      email: emailGmail,
      telefono: telefono || "No especificado"
    },
    items: carrito.map(item => {
      const prodOriginal = productos.find(p => p.id === item.id) || {};
      return {
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        linkArchivos: prodOriginal.linkArchivos || "",
        linkVideo: prodOriginal.linkVideo || ""
      };
    }),
    total: sumaTotal,
    estado: "pendiente", // "pendiente" | "completada" | "cancelada"
    archivosEnviados: false,
    fechaEnvioArchivos: null
  };

  pedidos.unshift(nuevoPedido);
  guardarPedidosEnStorage();

  // Sincronización en la nube con Supabase si está configurado
  if (typeof estaSupabaseConfigurado === "function" && estaSupabaseConfigurado()) {
    try {
      await supabaseCrearPedido(nuevoPedido);
      guardarPedidosEnStorage();
    } catch (err) {
      console.warn("[Supabase] No se pudo guardar pedido en la nube:", err);
    }
  }

  // Vaciamos el carrito tras finalizar la orden
  carrito = [];
  guardarCarritoEnStorage();
  actualizarContadorCarrito();
  renderCarrito();

  // Limpiamos los campos del formulario del cliente
  if (document.getElementById("form-datos-cliente")) {
    document.getElementById("form-datos-cliente").reset();
  }

  cerrarCheckout();

  // Desplegamos modal de confirmación con WhatsApp y descarga de PDF de muestra
  mostrarModalConfirmacion(nuevoPedido);

  renderAdmin();
  renderCatalogo();
  cambiarVista("catalogo");
  mostrarToast("¡Pedido registrado exitosamente!");
}

/**
 * ====================================================================
 * MODAL DE CONFIRMACIÓN Y COMPROBANTE WHATSAPP
 * ====================================================================
 */
function mostrarModalConfirmacion(pedido) {
  const modal = document.getElementById("modal-confirmacion-pedido");
  const contenedorBody = document.getElementById("confirmacion-modal-body");
  if (!modal || !contenedorBody) return;

  const totalFormateado = formatearPrecio(pedido.total);
  const itemsLista = pedido.items.map(i => `${i.nombre} (x${i.cantidad})`).join(", ");

  const mensajeWhatsApp = encodeURIComponent(
    `¡Hola Cosé con Giu! Acabo de realizar la transferencia bancaria para mi pedido ${pedido.codigo}.\n` +
    `• Nombre: ${pedido.cliente.nombre}\n` +
    `• Email Gmail: ${pedido.cliente.email}\n` +
    `• Moldes: ${itemsLista}\n` +
    `• Monto: $${totalFormateado}\n\n` +
    `Adjunto el comprobante de pago para su verificación y envío de los moldes a Google Drive. ¡Muchas gracias!`
  );

  contenedorBody.innerHTML = `
    <div class="order-success-hero">
      <div class="order-success-icon"><i data-lucide="check-check" style="width: 3.2rem; height: 3.2rem; color: #16a34a;"></i></div>
      <h3 style="color: var(--primary-dark); margin-bottom: 0.35rem;">¡Muchas gracias, ${escaparHTML(pedido.cliente.nombre)}!</h3>
      <p style="color: var(--text-muted); font-size: 0.92rem;">
        Tu pedido ha sido registrado con éxito bajo estado <strong>Pendiente de revisión</strong>.
      </p>
      <div class="order-success-code-pill">
        Código de Pedido: <strong>${escaparHTML(pedido.codigo)}</strong>
      </div>
    </div>

    <div class="order-success-details">
      <div class="order-success-row">
        <span>Total a transferir:</span>
        <strong style="color: var(--primary); font-size: 1.05rem;">$${totalFormateado}</strong>
      </div>
      <div class="order-success-row">
        <span>Correo Gmail registrado:</span>
        <strong>${escaparHTML(pedido.cliente.email)}</strong>
      </div>
      <div class="order-success-row">
        <span>Estado del pedido:</span>
        <span class="badge-estado pendiente"><i data-lucide="clock" class="badge-icon"></i> Pendiente</span>
      </div>
      <div class="order-success-row">
        <span>Entrega:</span>
        <span>Google Drive (tras verificar pago)</span>
      </div>
    </div>

    <div class="whatsapp-action-box">
      <h4 style="color: #166534; margin-bottom: 0.35rem; font-size: 1rem;"><i data-lucide="message-circle" class="ui-icon"></i> Envíanos tu comprobante por WhatsApp</h4>
      <p style="font-size: 0.85rem; color: #14532d; margin-bottom: 0.85rem;">
        Haz clic para abrir WhatsApp con el mensaje ya armado. Solo debes adjuntar la captura de la transferencia.
      </p>
      <a href="https://api.whatsapp.com/send?phone=5491144558899&text=${mensajeWhatsApp}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp" title="Enviar comprobante por WhatsApp">
        <i data-lucide="message-circle" class="ui-icon"></i> Enviar Comprobante por WhatsApp
      </a>
    </div>

    <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius); padding: 0.85rem 1rem; text-align: left;">
      <h5 style="color: var(--primary-dark); font-size: 0.88rem; margin-bottom: 0.2rem;"><i data-lucide="file-text" class="ui-icon"></i> Muestra de Costura preliminar:</h5>
      <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
        Puedes descargar una guía de prueba de impresión en PDF mientras verificamos tu pago.
      </p>
      <button type="button" class="btn-sample-download" onclick="descargarMuestraPDF()">
        <i data-lucide="download" class="ui-icon"></i> Descargar Guía de Costura de Muestra (PDF)
      </button>
    </div>
  `;

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  actualizarIconosLucide();
}

function cerrarModalConfirmacion() {
  const modal = document.getElementById("modal-confirmacion-pedido");
  if (modal) {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }
}

/**
 * Genera y descarga un archivo PDF de muestra válido en Vanilla JS
 */
function descargarMuestraPDF() {
  const contenidoPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 280 >> stream
BT
/F1 20 Tf
50 720 Td
(COSE CON GIU - MUESTRA DE COSTURA) Tj
/F1 12 Tf
0 -40 Td
(Felicitaciones por tu compra en Cose con Giu.) Tj
0 -20 Td
(Esta es una muestra de calibracion de impresion para molderia en PDF.) Tj
0 -20 Td
(Asegurate de imprimir en escala 100% sin ajuste automatico.) Tj
0 -25 Td
(Tus moldes finales completos seran enviados a tu correo de Gmail.) Tj
ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000118 00000 n 
0000000250 00000 n 
0000000582 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
654
%%EOF`;

  try {
    const blob = new Blob([contenidoPdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "Guia_Muestra_Costura_Cose_con_Giu.pdf";
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
    mostrarToast("Descargando guía de muestra en PDF...");
  } catch (error) {
    mostrarToast("No se pudo generar la descarga en este navegador.");
  }
}

/**
 * ====================================================================
 * 4. PANEL DE ADMINISTRACIÓN (MOLDES, PRECIOS, PROMOCIONES)
 * ====================================================================
 */
function toggleCampoPromo() {
  const selectPromo = document.getElementById("producto-promo");
  const grupoPrecioPromo = document.getElementById("grupo-precio-promo");
  const inputPrecioPromo = document.getElementById("producto-precio-promo");

  if (selectPromo.value === "si") {
    grupoPrecioPromo.style.display = "block";
    inputPrecioPromo.required = true;
  } else {
    grupoPrecioPromo.style.display = "none";
    inputPrecioPromo.required = false;
    inputPrecioPromo.value = "";
  }
}

async function guardarProducto(evento) {
  evento.preventDefault();
  const idInput = document.getElementById("producto-id").value;
  const nombre = document.getElementById("producto-nombre").value.trim();
  const descripcion = document.getElementById("producto-descripcion").value.trim();
  const categoria = document.getElementById("producto-categoria") ? document.getElementById("producto-categoria").value : "Otros";
  const icono = document.getElementById("producto-icono") ? document.getElementById("producto-icono").value : "file-text";
  const precio = parseFloat(document.getElementById("producto-precio").value);
  const esPromo = document.getElementById("producto-promo").value === "si";
  const precioPromo = esPromo ? parseFloat(document.getElementById("producto-precio-promo").value || 0) : 0;
  const fileInput = document.getElementById("producto-imagen");
  const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
  const linkArchivos = document.getElementById("producto-link-archivos") ? document.getElementById("producto-link-archivos").value.trim() : "";
  const linkVideo = document.getElementById("producto-link-video") ? document.getElementById("producto-link-video").value.trim() : "";

  if (!nombre || isNaN(precio) || precio < 0) {
    mostrarToast("Por favor ingresa datos válidos.");
    return;
  }

  // Función interna para persistir producto una vez resuelta la imagen
  async function aplicarGuardado(imagenData) {
    let productoGuardado = null;

    if (idInput) {
      // MODO EDITAR PRODUCTO EXISTENTE
      const productoId = parseInt(idInput, 10);
      const index = productos.findIndex(p => p.id === productoId);
      if (index !== -1) {
        productos[index].nombre = nombre;
        productos[index].descripcion = descripcion;
        productos[index].categoria = categoria;
        productos[index].icono = icono;
        productos[index].precio = precio;
        productos[index].enPromo = esPromo;
        productos[index].precioPromo = precioPromo;
        productos[index].linkArchivos = linkArchivos;
        productos[index].linkVideo = linkVideo;
        if (imagenData) productos[index].imagen = imagenData;
        productoGuardado = productos[index];
        mostrarToast("Molde actualizado con éxito.");
      }
    } else {
      // MODO AGREGAR NUEVO PRODUCTO
      const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
      productoGuardado = {
        id: nuevoId,
        nombre: nombre,
        descripcion: descripcion,
        categoria: categoria,
        icono: icono,
        precio: precio,
        enPromo: esPromo,
        precioPromo: precioPromo,
        linkArchivos: linkArchivos,
        linkVideo: linkVideo,
        imagen: imagenData || null
      };
      productos.push(productoGuardado);
      mostrarToast("Nuevo molde guardado en el catálogo.");
    }

    guardarProductosEnStorage();

    // Sincronización en la nube con Supabase si está activo
    if (productoGuardado && typeof estaSupabaseConfigurado === "function" && estaSupabaseConfigurado()) {
      try {
        await supabaseGuardarProducto(productoGuardado);
        guardarProductosEnStorage();
      } catch (err) {
        console.warn("[Supabase] No se pudo guardar molde en la nube:", err);
      }
    }

    resetearFormulario();
    renderCategoriasChips();
    renderAdmin();
    renderCatalogo();
  }

  // Gestión de imagen: Intentar subir a Supabase Storage si está conectado, con fallback a DataURL
  if (file) {
    if (typeof estaSupabaseConfigurado === "function" && estaSupabaseConfigurado()) {
      mostrarToast("Subiendo foto a Supabase Storage...");
      const urlStorage = await supabaseSubirImagenMolde(file);
      if (urlStorage) {
        await aplicarGuardado(urlStorage);
        return;
      }
    }

    // Fallback: leer archivo local como DataURL
    const reader = new FileReader();
    reader.onload = async function(e) {
      await aplicarGuardado(e.target.result);
    };
    reader.onerror = function() {
      mostrarToast('Error al leer la imagen. Intenta con otro archivo.');
    };
    reader.readAsDataURL(file);
  } else {
    await aplicarGuardado(null);
  }
}

function editarProducto(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  // Llenamos el formulario con los datos a editar
  document.getElementById("producto-id").value = producto.id;
  document.getElementById("producto-nombre").value = producto.nombre;
  document.getElementById("producto-descripcion").value = producto.descripcion;
  document.getElementById("producto-precio").value = producto.precio;

  if (document.getElementById("producto-categoria")) {
    document.getElementById("producto-categoria").value = producto.categoria || "Vestidos";
  }

  if (document.getElementById("producto-icono")) {
    document.getElementById("producto-icono").value = producto.icono || "scissors";
  }

  if (document.getElementById("producto-link-archivos")) {
    document.getElementById("producto-link-archivos").value = producto.linkArchivos || "";
  }

  if (document.getElementById("producto-link-video")) {
    document.getElementById("producto-link-video").value = producto.linkVideo || "";
  }

  const selectPromo = document.getElementById("producto-promo");
  selectPromo.value = producto.enPromo ? "si" : "no";
  toggleCampoPromo();

  if (producto.enPromo) {
    document.getElementById("producto-precio-promo").value = producto.precioPromo;
  }

  document.getElementById("admin-form-titulo").textContent = "Editar Molde Existente";
  document.getElementById("btn-guardar-producto").textContent = "Actualizar Molde";
  document.getElementById("btn-cancelar-edicion").style.display = "inline-flex";

  // Hacer scroll hacia el formulario
  document.getElementById("admin-form-titulo").scrollIntoView({ behavior: "smooth" });

  // Mostrar vista previa de imagen si existe
  const previewWrap = document.getElementById("producto-preview-wrap");
  const previewImg = document.getElementById("producto-preview");
  if (producto.imagen && previewImg && previewWrap) {
    previewImg.src = producto.imagen;
    previewWrap.style.display = "block";
  } else if (previewWrap) {
    previewWrap.style.display = "none";
    if (previewImg) previewImg.src = "";
  }
}

async function eliminarProducto(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const confirmacion = confirm(`¿Estás seguro de que deseas eliminar "${producto.nombre}" del catálogo?`);
  if (!confirmacion) return;

  // Sincronización en la nube si Supabase está activo
  if (typeof estaSupabaseConfigurado === "function" && estaSupabaseConfigurado()) {
    try {
      await supabaseEliminarProducto(id);
    } catch (err) {
      console.warn("[Supabase] Error al eliminar molde en la nube:", err);
    }
  }

  productos = productos.filter(p => p.id !== id);
  guardarProductosEnStorage();

  // Si también estaba en el carrito, lo quitamos
  carrito = carrito.filter(item => item.id !== id);
  guardarCarritoEnStorage();
  actualizarContadorCarrito();

  renderCategoriasChips();
  renderAdmin();
  renderCatalogo();
  mostrarToast("Molde eliminado correctamente.");
}

function resetearFormulario() {
  document.getElementById("form-producto").reset();
  document.getElementById("producto-id").value = "";
  document.getElementById("admin-form-titulo").textContent = "Agregar Nuevo Molde";
  document.getElementById("btn-guardar-producto").textContent = "Guardar Molde";
  document.getElementById("btn-cancelar-edicion").style.display = "none";
  if (document.getElementById("producto-categoria")) {
    document.getElementById("producto-categoria").value = "Vestidos";
  }
  if (document.getElementById("producto-icono")) {
    document.getElementById("producto-icono").value = "scissors";
  }
  toggleCampoPromo();
  // Limpiar input file y vista previa
  const fileInput = document.getElementById("producto-imagen");
  if (fileInput) {
    try { fileInput.value = null; } catch (e) { /* ignore for browsers that restrict setting file input */ }
  }
  const previewWrap = document.getElementById("producto-preview-wrap");
  const previewImg = document.getElementById("producto-preview");
  if (previewWrap) previewWrap.style.display = "none";
  if (previewImg) previewImg.src = "";
}

function restablecerCatalogoDefecto() {
  const confirmar = confirm("¿Deseas restablecer el catálogo a los 4 moldes de ejemplo iniciales?");
  if (!confirmar) return;

  productos = JSON.parse(JSON.stringify(PRODUCTOS_POR_DEFECTO));
  guardarProductosEnStorage();
  resetearFormulario();
  renderCategoriasChips();
  renderAdmin();
  renderCatalogo();
  mostrarToast("Catálogo restablecido con éxito.");
}

function renderAdmin() {
  renderMetricasAdmin();
  renderPedidosAdmin();
  renderCatalogoAdmin();
}

/**
 * Renderiza los paneles de métricas (Producto Más Vendido, Total Pedidos e Ingresos)
 */
function renderMetricasAdmin() {
  const metricas = calcularMetricasAdmin();

  const elTopNombre = document.getElementById("admin-top-producto-nombre");
  const elTopDetalle = document.getElementById("admin-top-producto-detalle");
  const elTotalPedidos = document.getElementById("admin-total-pedidos");
  const elPedidosDetalle = document.getElementById("admin-pedidos-detalle");
  const elTotalRecaudado = document.getElementById("admin-total-recaudado");

  if (metricas.topProducto) {
    if (elTopNombre) elTopNombre.textContent = metricas.topProducto.nombre;
    if (elTopDetalle) {
      elTopDetalle.textContent = `${metricas.topProducto.unidades} ${metricas.topProducto.unidades === 1 ? 'unidad entregada' : 'unidades entregadas'} ($${formatearPrecio(metricas.topProducto.total)})`;
    }
  } else {
    if (elTopNombre) elTopNombre.textContent = "Aún sin ventas entregadas";
    if (elTopDetalle) elTopDetalle.textContent = "Las compras confirmadas se reflejarán aquí";
  }

  if (elTotalPedidos) elTotalPedidos.textContent = metricas.totalPedidos;
  if (elPedidosDetalle) {
    elPedidosDetalle.textContent = `${metricas.completados} completados · ${metricas.pendientes} pendientes · ${metricas.cancelados} cancelados`;
  }

  if (elTotalRecaudado) {
    elTotalRecaudado.textContent = `$${formatearPrecio(metricas.totalRecaudado)}`;
  }
}

/**
 * Búsqueda y Filtros en Panel Admin
 */
function filtrarAdminPorBusqueda(query) {
  filtrosAdmin.busqueda = (query || "").trim().toLowerCase();
  const btnClear = document.getElementById("btn-clear-admin-search");
  if (btnClear) {
    btnClear.style.display = filtrosAdmin.busqueda ? "flex" : "none";
  }
  renderPedidosAdmin();
  renderCatalogoAdmin();
}

function limpiarBusquedaAdmin() {
  const input = document.getElementById("admin-busqueda");
  if (input) input.value = "";
  filtrarAdminPorBusqueda("");
  if (input) input.focus();
}

function filtrarPedidosAdmin() {
  const filtroEstado = document.getElementById("filtro-pedidos-estado");
  const filtroFechaRapida = document.getElementById("filtro-pedidos-fecha-rapida");
  const filtroFechaInput = document.getElementById("filtro-pedidos-fecha-input");

  filtrosAdmin.estado = filtroEstado ? filtroEstado.value : "todos";
  filtrosAdmin.fechaRapida = filtroFechaRapida ? filtroFechaRapida.value : "todas";
  filtrosAdmin.fechaEspecifica = filtroFechaInput ? filtroFechaInput.value : "";

  renderPedidosAdmin();
}

function toggleDetallePedido(pedidoId) {
  if (pedidosExpandidos.has(pedidoId)) {
    pedidosExpandidos.delete(pedidoId);
  } else {
    pedidosExpandidos.add(pedidoId);
  }
  renderPedidosAdmin();
}

/**
 * Renderiza el listado de ventas en tarjetas expandibles con color según estado
 */
function renderPedidosAdmin() {
  const contenedor = document.getElementById("lista-admin-pedidos");
  const contador = document.getElementById("total-pedidos-count");
  if (!contenedor) return;

  const hoy = new Date();
  const hoyStr = obtenerFechaLocalTexto(hoy);

  let pedidosFiltrados = pedidos.filter(pedido => {
    // 1. Filtro por estado
    if (filtrosAdmin.estado !== "todos" && pedido.estado !== filtrosAdmin.estado) {
      return false;
    }

    // 2. Filtro por texto (comprador, email, teléfono, código o nombre de molde)
    if (filtrosAdmin.busqueda) {
      const q = filtrosAdmin.busqueda;
      const codMatch = (pedido.codigo || "").toLowerCase().includes(q);
      const nombreMatch = (pedido.cliente.nombre || "").toLowerCase().includes(q);
      const emailMatch = (pedido.cliente.email || "").toLowerCase().includes(q);
      const telMatch = (pedido.cliente.telefono || "").toLowerCase().includes(q);
      const itemsMatch = pedido.items.some(i => (i.nombre || "").toLowerCase().includes(q));

      if (!codMatch && !nombreMatch && !emailMatch && !telMatch && !itemsMatch) {
        return false;
      }
    }

    // 3. Filtro por fecha específica (input date: YYYY-MM-DD -> DD/MM/YYYY)
    if (filtrosAdmin.fechaEspecifica) {
      const partes = filtrosAdmin.fechaEspecifica.split("-");
      if (partes.length === 3) {
        const fechaTarget = `${partes[2]}/${partes[1]}/${partes[0]}`;
        if (!pedido.fecha.startsWith(fechaTarget)) {
          return false;
        }
      }
    } else if (filtrosAdmin.fechaRapida && filtrosAdmin.fechaRapida !== "todas") {
      // 4. Filtro por fecha rápida (hoy, semana, mes) conforme a la skill local-dates
      const fechaCorta = pedido.fecha.split(",")[0].trim();
      const partesFecha = fechaCorta.split("/").map(Number);
      
      if (partesFecha.length === 3) {
        // Construcción segura en hora local sin desvío UTC
        const fechaOrden = new Date(partesFecha[2], partesFecha[1] - 1, partesFecha[0]);
        const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        
        if (filtrosAdmin.fechaRapida === "hoy") {
          if (fechaCorta !== hoyStr) return false;
        } else if (filtrosAdmin.fechaRapida === "semana") {
          // Usamos setDate() para restar 7 días sin depender de milisegundos ni fallar en cambio de hora
          const limiteSemana = new Date(hoyInicio.getFullYear(), hoyInicio.getMonth(), hoyInicio.getDate());
          limiteSemana.setDate(limiteSemana.getDate() - 7);
          if (fechaOrden < limiteSemana || fechaOrden > hoyInicio) {
            return false;
          }
        } else if (filtrosAdmin.fechaRapida === "mes") {
          if (fechaOrden.getMonth() !== hoy.getMonth() || fechaOrden.getFullYear() !== hoy.getFullYear()) {
            return false;
          }
        }
      }
    }

    return true;
  });

  if (contador) contador.textContent = pedidosFiltrados.length;

  if (pedidosFiltrados.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem; background: var(--bg-card); border-radius: 10px; border: 1px dashed var(--border);">
        <div style="margin-bottom: 0.4rem;"><i data-lucide="inbox" style="width: 2.5rem; height: 2.5rem; color: var(--text-muted);"></i></div>
        <h4>No se encontraron ventas</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">Prueba ajustando los filtros de fecha, estado o búsqueda.</p>
      </div>
    `;
    actualizarIconosLucide();
    return;
  }

  contenedor.innerHTML = pedidosFiltrados.map(pedido => {
    const estaExpandido = pedidosExpandidos.has(pedido.id);

    const estadoPill = {
      pendiente: '<span class="badge-estado pendiente"><i data-lucide="clock" class="badge-icon"></i> Pendiente</span>',
      completada: '<span class="badge-estado completada"><i data-lucide="check-circle-2" class="badge-icon"></i> Completada</span>',
      cancelada: '<span class="badge-estado cancelada"><i data-lucide="x-circle" class="badge-icon"></i> Cancelada</span>'
    }[pedido.estado] || `<span class="badge-estado">${pedido.estado}</span>`;

    // Botones de acción según el estado actual del pedido
    let accionesHtml = "";
    if (pedido.estado === "pendiente") {
      accionesHtml = `
        <button class="btn-action btn-action-complete" onclick="cambiarEstadoPedido(${pedido.id}, 'completada')" title="Confirmar transferencia y marcar molde entregado">
          <i data-lucide="check-circle-2" class="ui-icon"></i> Completar (Entregar)
        </button>
        <button class="btn-action btn-action-cancel" onclick="cambiarEstadoPedido(${pedido.id}, 'cancelada')" title="Cancelar pedido por falta de transferencia">
          <i data-lucide="x-circle" class="ui-icon"></i> Cancelar
        </button>
      `;
    } else if (pedido.estado === "completada") {
      const yaEnviado = Boolean(pedido.archivosEnviados);
      const botonEnvio = yaEnviado
        ? `
          <button type="button" class="btn-action btn-action-send-files sent" disabled title="Archivos y video enviados el ${escaparHTML(pedido.fechaEnvioArchivos || '')}">
            <i data-lucide="check-check" class="ui-icon"></i> Archivos enviados ✓
          </button>
          <button type="button" class="btn-action btn-action-resend" onclick="reenviarArchivosPedido(${pedido.id})" title="Volver a abrir el correo por si el cliente no lo recibió">
            <i data-lucide="rotate-ccw" class="ui-icon"></i> Reenviar
          </button>
        `
        : `
          <button type="button" class="btn-action btn-action-send-files" onclick="enviarArchivosPedido(${pedido.id})" title="Abrir correo con enlaces de Google Drive y Video Tutorial para el comprador">
            <i data-lucide="send" class="ui-icon"></i> Enviar archivos y video
          </button>
        `;

      accionesHtml = `
        ${botonEnvio}
        <button class="btn-action btn-action-pending" onclick="cambiarEstadoPedido(${pedido.id}, 'pendiente')" title="Volver a estado pendiente de revisión">
          <i data-lucide="clock" class="ui-icon"></i> Volver a Pendiente
        </button>
        <button class="btn-action btn-action-cancel" onclick="cambiarEstadoPedido(${pedido.id}, 'cancelada')" title="Cancelar compra">
          <i data-lucide="x-circle" class="ui-icon"></i> Cancelar
        </button>
      `;
    } else if (pedido.estado === "cancelada") {
      accionesHtml = `
        <button class="btn-action btn-action-pending" onclick="cambiarEstadoPedido(${pedido.id}, 'pendiente')" title="Reactivar pedido a pendiente">
          <i data-lucide="rotate-ccw" class="ui-icon"></i> Reactivar
        </button>
        <button class="btn-action btn-action-cancel" onclick="eliminarPedido(${pedido.id})" title="Eliminar registro definitivamente">
          <i data-lucide="trash-2" class="ui-icon"></i> Borrar
        </button>
      `;
    }

    const totalUnidades = pedido.items.reduce((acc, item) => acc + (item.cantidad || 1), 0);

    return `
      <div class="order-expandable-card ${pedido.estado}" id="order-card-${pedido.id}">
        <!-- Cabecera de la tarjeta: siempre visible y clicable -->
        <div class="order-card-header" onclick="toggleDetallePedido(${pedido.id})" title="Haz clic para desplegar u ocultar detalles">
          <div class="order-card-meta">
            <span class="order-code-badge">${pedido.codigo || ('#' + pedido.id.toString().slice(-4))}</span>
            <span class="order-card-buyer">${escaparHTML(pedido.cliente.nombre)}</span>
            <span class="order-card-date"><i data-lucide="calendar" class="ui-icon"></i> ${pedido.fecha}</span>
          </div>

          <div class="order-card-amount-box">
            <span class="order-card-total">$${formatearPrecio(pedido.total)}</span>
            ${estadoPill}
            <button type="button" class="order-toggle-btn" onclick="event.stopPropagation(); toggleDetallePedido(${pedido.id});">
              ${estaExpandido ? 'Ocultar ▲' : 'Ver detalle ▼'}
            </button>
          </div>
        </div>

        <!-- Cuerpo desplegable de la tarjeta -->
        <div class="order-card-body ${estaExpandido ? 'open' : ''}">
          <div class="order-detail-grid">
            <div class="order-detail-block">
              <h5><i data-lucide="user" class="ui-icon"></i> Datos del Comprador</h5>
              <div class="order-detail-content">
                <strong>${escaparHTML(pedido.cliente.nombre)}</strong><br>
                <i data-lucide="mail" class="ui-icon"></i> <a href="mailto:${escaparHTML(pedido.cliente.email)}" style="color: var(--primary); text-decoration: none;">${escaparHTML(pedido.cliente.email)}</a><br>
                <i data-lucide="phone" class="ui-icon"></i> ${pedido.cliente.telefono && pedido.cliente.telefono !== "No especificado" ? escaparHTML(pedido.cliente.telefono) : '<span style="color: var(--text-muted);">Sin WhatsApp</span>'}
              </div>
            </div>

            <div class="order-detail-block order-detail-block-items">
              <h5><i data-lucide="package" class="ui-icon"></i> Moldes Comprados (${totalUnidades} ${totalUnidades === 1 ? 'unidad' : 'unidades'})</h5>
              <div class="order-detail-content">
                ${pedido.items.map(item => `
                  <div style="padding: 0.35rem 0; border-bottom: 1px dashed rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                    <span style="flex: 1; min-width: 0; word-break: break-word;">• <strong>${escaparHTML(item.nombre)}</strong> (x${item.cantidad})</span>
                    <strong style="white-space: nowrap; margin-left: 0.5rem; flex-shrink: 0;">$${formatearPrecio(item.precio * item.cantidad)}</strong>
                  </div>
                `).join("")}

                ${pedido.archivosEnviados ? `
                  <div style="margin-top: 0.65rem; padding: 0.45rem 0.65rem; background: #ecfdf5; border-radius: 6px; font-size: 0.82rem; color: #065f46; display: flex; align-items: center; gap: 0.35rem; border: 1px solid #a7f3d0;">
                    <i data-lucide="check-check" class="ui-icon"></i> Archivos y video enviados por correo el <strong>${escaparHTML(pedido.fechaEnvioArchivos || 'fecha registrada')}</strong>
                  </div>
                ` : (pedido.estado === 'completada' ? `
                  <div style="margin-top: 0.65rem; padding: 0.45rem 0.65rem; background: #fefce8; border-radius: 6px; font-size: 0.82rem; color: #854d0e; display: flex; align-items: center; gap: 0.35rem; border: 1px solid #fef08a;">
                    <i data-lucide="alert-circle" class="ui-icon"></i> Pago confirmado. Haz clic en <strong>"Enviar archivos y video"</strong> para enviar los accesos por correo.
                  </div>
                ` : '')}
              </div>
            </div>
          </div>

          <div class="order-card-footer">
            <span style="font-size: 0.85rem; color: var(--text-muted);">
              Total de la orden: <strong style="color: var(--text-main); font-size: 1.05rem;">$${formatearPrecio(pedido.total)}</strong>
            </span>
            <div class="actions-cell">
              ${accionesHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  actualizarIconosLucide();
}

/**
 * ====================================================================
 * 5. ENTREGA DIGITAL: GENERACIÓN Y ENVÍO DE ARCHIVOS Y VIDEO POR EMAIL
 * ====================================================================
 */

/**
 * Genera el asunto, cuerpo y las URLs de envío de correo (Gmail Web Compose y mailto)
 * para la entrega de los moldes y videos de un pedido confirmado.
 */
function generarEnlaceCorreoEntrega(pedido) {
  const clienteNombre = (pedido.cliente && pedido.cliente.nombre) ? pedido.cliente.nombre.trim() : "Comprador";
  const clienteEmail = (pedido.cliente && pedido.cliente.email) ? pedido.cliente.email.trim() : "";
  const codigo = pedido.codigo || ('#' + pedido.id.toString().slice(-4));

  // Generamos la lista de enlaces por cada molde comprado
  const lineasMoldes = pedido.items.map((item, idx) => {
    const prodEnCatalogo = productos.find(p => p.id === item.id) || {};
    const linkDrive = (item.linkArchivos || prodEnCatalogo.linkArchivos || ENLACE_DRIVE_GENERAL).trim();
    const linkVideo = (item.linkVideo || prodEnCatalogo.linkVideo || ENLACE_VIDEO_GENERAL).trim();

    return `${idx + 1}. ${item.nombre} (x${item.cantidad || 1})\n` +
           `   • Archivos PDF para imprimir (Google Drive): ${linkDrive}\n` +
           `   • Video Tutorial paso a paso: ${linkVideo}`;
  }).join("\n\n");

  const asunto = `Entrega de Moldes Digitales y Video Tutorial - Pedido ${codigo} | Cosé con Giu`;
  const cuerpo =
`¡Hola, ${clienteNombre}!

¡Muchísimas gracias por tu compra en Cosé con Giu!
Hemos verificado tu pago con éxito. A continuación encontrarás los enlaces de acceso inmediato a tus moldes en PDF listos para imprimir y sus correspondientes videos tutoriales paso a paso:

${lineasMoldes}

💡 Recomendaciones de costura e impresión:
- Al imprimir los patrones, selecciona "Tamaño real" o "Escala 100%" en los ajustes de tu impresora y verifica el cuadrado de calibración de 5x5 cm.
- Puedes ver el video tutorial todas las veces que lo desees para guiarte en el corte de telas, armado y confección de la prenda.

Si tienes alguna duda o precisas asistencia, puedes responder directamente a este correo o escribirnos a nuestro WhatsApp.

¡Que disfrutes muchísimo tu proyecto de costura!
Con cariño,
Giu - Cosé con Giu`;

  const urlGmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(clienteEmail)}&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  const urlMailto = `mailto:${encodeURIComponent(clienteEmail)}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;

  return { urlGmail, urlMailto, asunto, cuerpo };
}

/**
 * Abre el correo pre-armado para enviar archivos y video al cliente, y marca el pedido como enviado
 */
function enviarArchivosPedido(pedidoId) {
  const pedido = pedidos.find(p => p.id === pedidoId);
  if (!pedido) return;

  const { urlGmail, urlMailto } = generarEnlaceCorreoEntrega(pedido);

  // Intentamos abrir Gmail Web Compose en pestaña nueva (todos los compradores usan @gmail.com)
  const ventana = window.open(urlGmail, "_blank");
  if (!ventana || ventana.closed || typeof ventana.closed === "undefined") {
    // Si el navegador bloquea la pestaña emergente, usamos mailto como respaldo
    window.location.href = urlMailto;
  }

  // Actualizamos el estado del pedido
  pedido.archivosEnviados = true;
  pedido.fechaEnvioArchivos = obtenerFechaLocalHoraTexto(new Date());
  guardarPedidosEnStorage();

  // Sincronización en la nube si Supabase está activo
  if (typeof estaSupabaseConfigurado === "function" && estaSupabaseConfigurado()) {
    try {
      supabaseActualizarEstadoPedido(pedidoId, pedido.estado, true, pedido.fechaEnvioArchivos);
    } catch (e) {
      console.warn("[Supabase] Error al actualizar estado de envío:", e);
    }
  }

  renderPedidosAdmin();
  mostrarToast(`Correo preparado para ${pedido.cliente.nombre}. Marcado como enviado.`);
}

/**
 * Permite reabrir el correo de entrega si el cliente solicita un reenvío
 */
function reenviarArchivosPedido(pedidoId) {
  const pedido = pedidos.find(p => p.id === pedidoId);
  if (!pedido) return;

  const { urlGmail, urlMailto } = generarEnlaceCorreoEntrega(pedido);
  const ventana = window.open(urlGmail, "_blank");
  if (!ventana || ventana.closed || typeof ventana.closed === "undefined") {
    window.location.href = urlMailto;
  }

  mostrarToast(`Reabriendo correo de entrega para ${pedido.cliente.nombre}.`);
}

/**
 * Permite cambiar el estado de un pedido (completada, cancelada, pendiente)
 */
async function cambiarEstadoPedido(pedidoId, nuevoEstado) {
  const pedido = pedidos.find(p => p.id === pedidoId);
  if (!pedido) return;

  pedido.estado = nuevoEstado;
  guardarPedidosEnStorage();

  // Sincronización en la nube si Supabase está activo
  if (typeof estaSupabaseConfigurado === "function" && estaSupabaseConfigurado()) {
    try {
      await supabaseActualizarEstadoPedido(pedidoId, nuevoEstado);
    } catch (e) {
      console.warn("[Supabase] Error al sincronizar estado de pedido:", e);
    }
  }

  renderAdmin();
  renderCatalogo(); // El producto más vendido se recalcula dinámicamente

  const nombresEstado = {
    completada: "COMPLETADA (Molde entregado)",
    cancelada: "CANCELADA",
    pendiente: "PENDIENTE de transferencia"
  };

  mostrarToast(`Pedido ${pedido.codigo || ''}: marcado como ${nombresEstado[nuevoEstado] || nuevoEstado}.`);
}

/**
 * Elimina permanentemente un pedido cancelado
 */
async function eliminarPedido(pedidoId) {
  const pedido = pedidos.find(p => p.id === pedidoId);
  if (!pedido) return;

  const confirmar = confirm(`¿Deseas eliminar permanentemente el registro del pedido ${pedido.codigo || ''} de ${pedido.cliente.nombre}?`);
  if (!confirmar) return;

  // Sincronización en la nube si Supabase está activo
  if (typeof estaSupabaseConfigurado === "function" && estaSupabaseConfigurado()) {
    try {
      await supabaseEliminarPedido(pedidoId);
    } catch (e) {
      console.warn("[Supabase] Error al eliminar pedido en la nube:", e);
    }
  }

  pedidos = pedidos.filter(p => p.id !== pedidoId);
  pedidosExpandidos.delete(pedidoId);
  guardarPedidosEnStorage();
  renderAdmin();
  renderCatalogo();
  mostrarToast("Pedido eliminado del registro.");
}

/**
 * ====================================================================
 * CONTROLADORES DEL MODAL DE CONFIGURACIÓN DE SUPABASE (PRODUCCIÓN)
 * ====================================================================
 */
function abrirModalConfigSupabase() {
  const modal = document.getElementById("modal-config-supabase");
  if (!modal) return;

  const creds = typeof obtenerCredencialesSupabase === "function" ? obtenerCredencialesSupabase() : { url: "", anonKey: "" };
  const inputUrl = document.getElementById("input-supabase-url");
  const inputAnon = document.getElementById("input-supabase-anon");
  const feedback = document.getElementById("supabase-test-feedback");

  if (inputUrl) inputUrl.value = creds.url || "";
  if (inputAnon) inputAnon.value = creds.anonKey || "";
  if (feedback) feedback.style.display = "none";

  actualizarBadgeSupabaseUI();
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  actualizarIconosLucide();
}

function cerrarModalConfigSupabase() {
  const modal = document.getElementById("modal-config-supabase");
  if (modal) {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }
}

async function probarConexionSupabaseModal() {
  const inputUrl = document.getElementById("input-supabase-url");
  const inputAnon = document.getElementById("input-supabase-anon");
  const feedback = document.getElementById("supabase-test-feedback");
  if (!feedback) return;

  const url = inputUrl ? inputUrl.value.trim() : "";
  const key = inputAnon ? inputAnon.value.trim() : "";

  if (!url || !key) {
    feedback.className = "supabase-feedback-box error";
    feedback.textContent = "Ingresa la URL y la Anon Key antes de probar.";
    feedback.style.display = "block";
    return;
  }

  // Guardamos temporalmente para probar
  supabaseGuardarConfiguracion(url, key);
  feedback.className = "supabase-feedback-box";
  feedback.textContent = "Probando conexión con Supabase...";
  feedback.style.display = "block";

  const res = await supabaseProbarConexion();
  if (res.ok) {
    feedback.className = "supabase-feedback-box success";
    feedback.innerHTML = `<strong>✓ Conexión exitosa:</strong> ${escaparHTML(res.mensaje)}`;
    actualizarBadgeSupabaseUI("online");
  } else {
    feedback.className = "supabase-feedback-box error";
    feedback.innerHTML = `<strong>✕ Error al conectar:</strong> ${escaparHTML(res.mensaje)}`;
    actualizarBadgeSupabaseUI("error");
  }
}

async function guardarConfigSupabaseDesdeModal() {
  const inputUrl = document.getElementById("input-supabase-url");
  const inputAnon = document.getElementById("input-supabase-anon");
  const feedback = document.getElementById("supabase-test-feedback");

  const url = inputUrl ? inputUrl.value.trim() : "";
  const key = inputAnon ? inputAnon.value.trim() : "";

  const res = supabaseGuardarConfiguracion(url, key);
  if (!res.ok) {
    if (feedback) {
      feedback.className = "supabase-feedback-box error";
      feedback.textContent = res.mensaje;
      feedback.style.display = "block";
    }
    return;
  }

  mostrarToast("Guardando credenciales y sincronizando datos...");
  await sincronizarConSupabaseSiAplica();
  cerrarModalConfigSupabase();
  mostrarToast("¡Base de datos conectada con éxito!");
}

function restablecerModoLocalSupabase() {
  const confirmar = confirm("¿Deseas desconectar Supabase y volver al modo local con localStorage?");
  if (!confirmar) return;

  supabaseBorrarConfiguracion();
  actualizarBadgeSupabaseUI("local");

  const inputUrl = document.getElementById("input-supabase-url");
  const inputAnon = document.getElementById("input-supabase-anon");
  const feedback = document.getElementById("supabase-test-feedback");

  if (inputUrl) inputUrl.value = "";
  if (inputAnon) inputAnon.value = "";
  if (feedback) feedback.style.display = "none";

  cerrarModalConfigSupabase();
  mostrarToast("Desconectado de Supabase. Modo local activo.");
}

/**
 * Restablece la lista de pedidos con los 3 ejemplos de demostración
 */
function restablecerPedidosDefecto() {
  const confirmar = confirm("¿Deseas restablecer los pedidos de prueba con los ejemplos iniciales?");
  if (!confirmar) return;

  pedidos = JSON.parse(JSON.stringify(PEDIDOS_POR_DEFECTO));
  pedidosExpandidos.clear();
  guardarPedidosEnStorage();
  renderAdmin();
  renderCatalogo();
  mostrarToast("Pedidos de prueba restablecidos.");
}

/**
 * Renderiza la tabla de moldes registrados en el catálogo con enlaces directos
 */
function renderCatalogoAdmin() {
  const tabla = document.getElementById("tabla-admin-productos");
  const contador = document.getElementById("total-productos-count");
  if (!tabla) return;

  // Filtrado por búsqueda en admin si aplica
  let moldesFiltrados = productos;
  if (filtrosAdmin.busqueda) {
    const q = filtrosAdmin.busqueda;
    moldesFiltrados = productos.filter(p => {
      const nombreMatch = (p.nombre || "").toLowerCase().includes(q);
      const descMatch = (p.descripcion || "").toLowerCase().includes(q);
      const catMatch = (p.categoria || "").toLowerCase().includes(q);
      return nombreMatch || descMatch || catMatch;
    });
  }

  if (contador) contador.textContent = moldesFiltrados.length;

  if (moldesFiltrados.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">
          No se encontraron moldes en el catálogo con ese término de búsqueda.
        </td>
      </tr>
    `;
    return;
  }

  tabla.innerHTML = moldesFiltrados.map(producto => `
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap:0.6rem;">
          ${producto.imagen ? `<img src="${producto.imagen}" alt="${escaparHTML(producto.nombre)}" style="width:56px;height:44px;object-fit:cover;border-radius:6px;border:1px solid var(--border);">` : `<span class="table-icon-thumb" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:var(--primary-soft);">${renderIconoMolde(producto.icono)}</span>`}
          <div style="flex:1;">
            <a href="#" class="table-product-link" onclick="verDetalleProducto(${producto.id}); return false;" title="Ver página y detalle de este molde">
              <strong>${escaparHTML(producto.nombre)}</strong> ↗
            </a>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${escaparHTML(producto.descripcion)}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="product-category-badge">${escaparHTML(producto.categoria || 'Moldería')}</span>
      </td>
      <td>
        ${producto.enPromo && producto.precioPromo > 0 ? `
          <strong>$${formatearPrecio(producto.precioPromo)}</strong>
          <span style="text-decoration: line-through; font-size: 0.8rem; color: var(--text-muted); display: block;">$${formatearPrecio(producto.precio)}</span>
        ` : `
          <strong>$${formatearPrecio(producto.precio)}</strong>
        `}
      </td>
      <td>
        <span class="promo-badge-pill ${producto.enPromo ? 'si' : 'no'}">
          ${producto.enPromo ? 'En promoción' : 'Normal'}
        </span>
      </td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-secondary btn-sm" onclick="editarProducto(${producto.id})" title="Editar precio, categoría o promoción">
            <i data-lucide="edit-3" class="ui-icon"></i> Editar
          </button>
          <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})" title="Eliminar del catálogo">
            <i data-lucide="trash-2" class="ui-icon"></i> Borrar
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  actualizarIconosLucide();
}

/**
 * ====================================================================
 * UTILIDADES AUXILIARES
 * ====================================================================
 */
function formatearPrecio(numero) {
  return Number(numero).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Solo admite correos @gmail.com (sin espacios, un único @).
 * Acepta alias con + porque siguen siendo cuentas de Gmail.
 */
function esCorreoGmail(email) {
  if (!email || typeof email !== "string") return false;
  const normalizado = email.trim().toLowerCase();
  return /^[^\s@]+@gmail\.com$/.test(normalizado);
}

function escaparHTML(texto) {
  if (!texto) return "";
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

let toastTimeout;
function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = mensaje;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}
