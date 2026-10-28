/**
 * ====================================================================
 * COSÉ CON GIU - CLIENTE Y CONECTOR DE BACKEND SUPABASE PARA PRODUCCIÓN
 * ====================================================================
 * Este módulo gestiona la persistencia real en la nube:
 * 1. Base de datos PostgreSQL (catálogo de moldes, ventas e ítems)
 * 2. Autenticación real de administradores (Supabase Auth)
 * 3. Almacenamiento de imágenes de moldes (Supabase Storage)
 * 4. Respaldo transparente en localStorage si no hay conexión o claves
 * ====================================================================
 */

// Clave en localStorage para guardar credenciales personalizadas desde la UI
const STORAGE_SUPABASE_CUSTOM = "tienda_supabase_custom_config";

// 1. CREDENCIALES ACTIVAS DE TU PROYECTO SUPABASE
const SUPABASE_CONFIG_DEFAULT = {
  url: "https://obvboktbdbahgbvemlid.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idmJva3RiZGJhaGdidmVtbGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMjAyMzMsImV4cCI6MjEwODc5NjIzM30.QJLpImAxgOQpOoObR8sATEninUZqPDYwLpo8FxKK9jU"
};

// Instancia única (singleton) del cliente de Supabase
let supabaseCliente = null;

/**
 * Normaliza la URL de Supabase eliminando rutas de endpoints como /rest/v1 o barras finales
 */
function normalizarUrlSupabase(url) {
  if (!url) return "";
  let u = url.trim();
  u = u.replace(/\/rest\/v1\/?$/, "");
  u = u.replace(/\/+$/, "");
  return u;
}

/**
 * Obtiene las credenciales activas (prioriza las guardadas en localStorage)
 */
function obtenerCredencialesSupabase() {
  try {
    const custom = localStorage.getItem(STORAGE_SUPABASE_CUSTOM);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed && parsed.url && parsed.anonKey) {
        return {
          url: normalizarUrlSupabase(parsed.url),
          anonKey: parsed.anonKey.trim(),
          origen: "custom"
        };
      }
    }
  } catch (e) {
    console.warn("[Supabase] No se pudo leer configuración personalizada:", e);
  }

  return {
    url: normalizarUrlSupabase(SUPABASE_CONFIG_DEFAULT.url),
    anonKey: (SUPABASE_CONFIG_DEFAULT.anonKey || "").trim(),
    origen: "default"
  };
}

/**
 * Comprueba si Supabase cuenta con credenciales configuradas
 */
function estaSupabaseConfigurado() {
  const creds = obtenerCredencialesSupabase();
  return Boolean(
    creds.url &&
    creds.anonKey &&
    !creds.url.includes("TU_SUPABASE") &&
    creds.url.startsWith("https://")
  );
}

/**
 * Inicializa y retorna el cliente oficial de Supabase
 */
function obtenerClienteSupabase() {
  if (supabaseCliente) return supabaseCliente;

  if (!estaSupabaseConfigurado()) {
    return null;
  }

  const creds = obtenerCredencialesSupabase();

  try {
    // Comprobamos si la librería @supabase/supabase-js está presente en window
    const libSupabase = window.supabase || (typeof supabase !== "undefined" ? supabase : null);
    if (libSupabase && libSupabase.createClient) {
      supabaseCliente = libSupabase.createClient(creds.url, creds.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      console.info("[Supabase] Cliente inicializado correctamente con:", creds.url);
      return supabaseCliente;
    } else {
      console.warn("[Supabase] Librería @supabase/supabase-js no detectada en window.");
      return null;
    }
  } catch (err) {
    console.error("[Supabase] Error al inicializar cliente:", err);
    return null;
  }
}

/**
 * Permite guardar credenciales personalizadas desde la interfaz
 */
function supabaseGuardarConfiguracion(url, anonKey) {
  const limpioUrl = normalizarUrlSupabase(url);
  const limpioKey = (anonKey || "").trim();

  if (!limpioUrl || !limpioKey) {
    return { ok: false, mensaje: "La URL y la Anon Key son obligatorias." };
  }

  if (!limpioUrl.startsWith("https://")) {
    return { ok: false, mensaje: "La URL de Supabase debe comenzar con https://" };
  }

  try {
    localStorage.setItem(STORAGE_SUPABASE_CUSTOM, JSON.stringify({
      url: limpioUrl,
      anonKey: limpioKey
    }));
    supabaseCliente = null; // Reiniciar instancia
    return { ok: true, mensaje: "Configuración guardada exitosamente." };
  } catch (e) {
    return { ok: false, mensaje: "No se pudo guardar la configuración: " + e.message };
  }
}

/**
 * Borra las credenciales personalizadas guardadas en el navegador
 */
function supabaseBorrarConfiguracion() {
  try {
    localStorage.removeItem(STORAGE_SUPABASE_CUSTOM);
    supabaseCliente = null;
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Prueba la conectividad con la base de datos de Supabase
 */
async function supabaseProbarConexion() {
  const client = obtenerClienteSupabase();
  if (!client) {
    return { ok: false, mensaje: "Supabase no está configurado o falta la librería." };
  }

  try {
    const { data, error } = await client
      .from("productos")
      .select("id")
      .limit(1);

    if (error) {
      return { ok: false, mensaje: `Error de consulta: ${error.message}` };
    }

    return { ok: true, mensaje: "¡Conexión establecida con éxito con Supabase!" };
  } catch (err) {
    return { ok: false, mensaje: `Excepción de red: ${err.message}` };
  }
}

/**
 * ====================================================================
 * 2. AUTENTICACIÓN (SUPABASE AUTH)
 * ====================================================================
 */

/**
 * Inicia sesión de administrador con correo y contraseña en Supabase Auth
 */
async function supabaseIniciarSesion(email, password) {
  const client = obtenerClienteSupabase();
  if (!client) {
    return { exito: false, mensaje: "Supabase no está conectado." };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim()
    });

    if (error) {
      return { exito: false, mensaje: error.message };
    }

    return { exito: true, usuario: data.user, sesion: data.session };
  } catch (err) {
    return { exito: false, mensaje: err.message };
  }
}

/**
 * Cierra la sesión de Supabase Auth
 */
async function supabaseCerrarSesion() {
  const client = obtenerClienteSupabase();
  if (!client) return true;

  try {
    await client.auth.signOut();
    return true;
  } catch (err) {
    console.error("[Supabase] Error al cerrar sesión:", err);
    return false;
  }
}

/**
 * Comprueba si hay una sesión activa de Supabase Auth
 */
async function supabaseObtenerSesion() {
  const client = obtenerClienteSupabase();
  if (!client) return null;

  try {
    const { data } = await client.auth.getSession();
    return data && data.session ? data.session : null;
  } catch (err) {
    return null;
  }
}

/**
 * ====================================================================
 * 3. ALMACENAMIENTO DE IMÁGENES (SUPABASE STORAGE)
 * ====================================================================
 */

/**
 * Sube un archivo de imagen al bucket "moldes-imagenes" y retorna la URL pública
 */
async function supabaseSubirImagenMolde(archivo) {
  const client = obtenerClienteSupabase();
  if (!client || !archivo) return null;

  try {
    const extension = (archivo.name.split(".").pop() || "jpg").toLowerCase();
    const nombreLimpio = archivo.name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
    const nombreUnico = `molde_${Date.now()}_${nombreLimpio}.${extension}`;

    const { data, error } = await client.storage
      .from("moldes-imagenes")
      .upload(nombreUnico, archivo, {
        cacheControl: "3600",
        upsert: true
      });

    if (error) {
      console.error("[Supabase Storage] Error al subir archivo:", error);
      return null;
    }

    const { data: publicData } = client.storage
      .from("moldes-imagenes")
      .getPublicUrl(nombreUnico);

    return publicData && publicData.publicUrl ? publicData.publicUrl : null;
  } catch (err) {
    console.error("[Supabase Storage] Excepción al subir imagen:", err);
    return null;
  }
}

/**
 * ====================================================================
 * 4. SERVICIOS DEL CATÁLOGO DE PRODUCTOS (MOLDES)
 * ====================================================================
 */

/**
 * Obtiene todos los moldes desde Supabase (con fallback a null)
 */
async function supabaseObtenerProductos() {
  const client = obtenerClienteSupabase();
  if (!client) {
    return null;
  }

  try {
    const { data, error } = await client
      .from("productos")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("[Supabase] Error al consultar productos:", error);
      return null;
    }

    // Mapeamos de snake_case (BD) a camelCase (UI)
    return (data || []).map(p => ({
      id: Number(p.id),
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: p.categoria || "Otros",
      icono: p.icono || "scissors",
      precio: Number(p.precio),
      enPromo: Boolean(p.en_promo),
      precioPromo: Number(p.precio_promo || 0),
      imagen: p.imagen || null,
      linkArchivos: p.link_archivos || "",
      linkVideo: p.link_video || ""
    }));
  } catch (err) {
    console.error("[Supabase] Excepción al obtener productos:", err);
    return null;
  }
}

/**
 * Guarda o actualiza un molde en Supabase
 */
async function supabaseGuardarProducto(producto) {
  const client = obtenerClienteSupabase();
  if (!client) return false;

  const payload = {
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    categoria: producto.categoria,
    icono: producto.icono,
    precio: producto.precio,
    en_promo: producto.enPromo,
    precio_promo: producto.precioPromo,
    imagen: producto.imagen,
    link_archivos: producto.linkArchivos,
    link_video: producto.linkVideo
  };

  try {
    if (producto.id && producto.id > 0) {
      // Edición de molde existente
      const { error } = await client
        .from("productos")
        .update(payload)
        .eq("id", producto.id);

      if (error) throw error;
    } else {
      // Alta de nuevo molde
      const { data, error } = await client
        .from("productos")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      if (data && data.id) producto.id = Number(data.id);
    }
    return true;
  } catch (err) {
    console.error("[Supabase] Error al guardar producto:", err);
    return false;
  }
}

/**
 * Elimina un molde de la base de datos de Supabase
 */
async function supabaseEliminarProducto(productoId) {
  const client = obtenerClienteSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from("productos")
      .delete()
      .eq("id", productoId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("[Supabase] Error al eliminar producto:", err);
    return false;
  }
}

/**
 * ====================================================================
 * 5. SERVICIOS DE PEDIDOS Y VENTAS
 * ====================================================================
 */

/**
 * Obtiene las ventas con sus ítems comprados desde Supabase
 */
async function supabaseObtenerPedidos() {
  const client = obtenerClienteSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("pedidos")
      .select(`
        id,
        codigo,
        fecha_texto,
        cliente_nombre,
        cliente_email,
        cliente_telefono,
        total,
        estado,
        archivos_enviados,
        fecha_envio_archivos,
        pedido_items (
          id,
          producto_id,
          nombre,
          precio,
          cantidad,
          link_archivos,
          link_video
        )
      `)
      .order("id", { ascending: false });

    if (error) {
      console.error("[Supabase] Error al consultar pedidos:", error);
      return null;
    }

    return (data || []).map(p => ({
      id: Number(p.id),
      codigo: p.codigo,
      fecha: p.fecha_texto,
      cliente: {
        nombre: p.cliente_nombre,
        email: p.cliente_email,
        telefono: p.cliente_telefono
      },
      total: Number(p.total),
      estado: p.estado,
      archivosEnviados: Boolean(p.archivos_enviados),
      fechaEnvioArchivos: p.fecha_envio_archivos || null,
      items: (p.pedido_items || []).map(it => ({
        id: it.producto_id || it.id,
        nombre: it.nombre,
        precio: Number(it.precio),
        cantidad: Number(it.cantidad || 1),
        linkArchivos: it.link_archivos || "",
        linkVideo: it.link_video || ""
      }))
    }));
  } catch (err) {
    console.error("[Supabase] Excepción al obtener pedidos:", err);
    return null;
  }
}

/**
 * Registra un nuevo pedido y sus ítems relacionales en Supabase
 */
async function supabaseCrearPedido(pedido) {
  const client = obtenerClienteSupabase();
  if (!client) return false;

  try {
    // 1. Insertamos cabecera del pedido
    const { data: pedidoData, error: pedidoError } = await client
      .from("pedidos")
      .insert([{
        codigo: pedido.codigo,
        fecha_texto: pedido.fecha,
        cliente_nombre: pedido.cliente.nombre,
        cliente_email: pedido.cliente.email,
        cliente_telefono: pedido.cliente.telefono,
        total: pedido.total,
        estado: pedido.estado || "pendiente",
        archivos_enviados: Boolean(pedido.archivosEnviados),
        fecha_envio_archivos: pedido.fechaEnvioArchivos || null
      }])
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    const nuevoPedidoId = pedidoData.id;
    pedido.id = Number(nuevoPedidoId);

    // 2. Insertamos ítems relacionales vinculados por pedido_id
    if (pedido.items && pedido.items.length > 0) {
      const itemsPayload = pedido.items.map(item => ({
        pedido_id: nuevoPedidoId,
        producto_id: item.id && item.id > 0 ? item.id : null,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad || 1,
        link_archivos: item.linkArchivos || "",
        link_video: item.linkVideo || ""
      }));

      const { error: itemsError } = await client
        .from("pedido_items")
        .insert(itemsPayload);

      if (itemsError) {
        console.error("[Supabase] Error al registrar ítems del pedido:", itemsError);
      }
    }

    return true;
  } catch (err) {
    console.error("[Supabase] Error al crear pedido:", err);
    return false;
  }
}

/**
 * Actualiza el estado y fecha de entrega de archivos de un pedido en Supabase
 */
async function supabaseActualizarEstadoPedido(pedidoId, nuevoEstado, archivosEnviados = null, fechaEnvioArchivos = null) {
  const client = obtenerClienteSupabase();
  if (!client) return false;

  const payload = { estado: nuevoEstado };
  if (archivosEnviados !== null) payload.archivos_enviados = Boolean(archivosEnviados);
  if (fechaEnvioArchivos !== null) payload.fecha_envio_archivos = fechaEnvioArchivos;

  try {
    const { error } = await client
      .from("pedidos")
      .update(payload)
      .eq("id", pedidoId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("[Supabase] Error al actualizar pedido:", err);
    return false;
  }
}

/**
 * Elimina un pedido y sus ítems en cascada en Supabase
 */
async function supabaseEliminarPedido(pedidoId) {
  const client = obtenerClienteSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from("pedidos")
      .delete()
      .eq("id", pedidoId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("[Supabase] Error al eliminar pedido:", err);
    return false;
  }
}
