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
  if (u.includes("ohvboktbdhahgbvemlid")) {
    u = u.replace("ohvboktbdhahgbvemlid", "obvboktbdbahgbvemlid");
  }
  u = u.replace(/\/rest\/v1\/?$/, "");
  u = u.replace(/\/+$/, "");
  return u;
}

/**
 * Obtiene las credenciales activas respetando la jerarquía de prioridad:
 * 1. Personalizada en localStorage (configurada desde el modal de la UI)
 * 2. Inyectada en window.__ENV (cargada opcionalmente desde js/env.js)
 * 3. Configuración por defecto del proyecto
 */
function obtenerCredencialesSupabase() {
  // 1. Prioridad: Guardado personalizado en localStorage
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

  // 2. Prioridad: Variables de entorno locales en window.__ENV (js/env.js)
  try {
    if (typeof window !== "undefined" && window.__ENV && window.__ENV.SUPABASE_URL && window.__ENV.SUPABASE_ANON_KEY) {
      const envUrl = window.__ENV.SUPABASE_URL.trim();
      const envKey = window.__ENV.SUPABASE_ANON_KEY.trim();
      if (envUrl && envKey && !envUrl.includes("tu-proyecto") && envUrl.startsWith("https://")) {
        return {
          url: normalizarUrlSupabase(envUrl),
          anonKey: envKey,
          origen: "env"
        };
      }
    }
  } catch (e) {
    console.warn("[Supabase] No se pudo leer window.__ENV:", e);
  }

  // 3. Fallback: Configuración por defecto
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
 * Registra un nuevo administrador en Supabase Auth
 */
async function supabaseRegistrarAdmin(email, password) {
  const client = obtenerClienteSupabase();
  if (!client) {
    return { exito: false, mensaje: "Supabase no está conectado." };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password: password.trim()
    });

    if (error) {
      return { exito: false, mensaje: error.message };
    }

    // Registro de respaldo en la tabla public.administradores (en caso de que el trigger de BD no esté activo)
    try {
      const emailNorm = email.trim().toLowerCase();
      await client.from("administradores").insert({
        user_id: data.user ? data.user.id : null,
        email: emailNorm,
        aprobado: false
      });
    } catch (e) {
      // Si ya existe o el trigger lo insertó, continuamos limpiamente
    }

    return {
      exito: true,
      usuario: data.user,
      sesion: data.session,
      requiereConfirmacion: !data.session
    };
  } catch (err) {
    return { exito: false, mensaje: err.message };
  }
}

/**
 * Envía un enlace de restablecimiento de contraseña a la casilla del administrador
 */
async function supabaseRecuperarPassword(email) {
  const client = obtenerClienteSupabase();
  if (!client) {
    return { exito: false, mensaje: "Supabase no está conectado." };
  }

  try {
    const redirectUrl = window.location.href.split("#")[0];
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl
    });

    if (error) {
      return { exito: false, mensaje: error.message };
    }

    return {
      exito: true,
      mensaje: "Enlace enviado. Revisa tu casilla de correo para restablecer la contraseña."
    };
  } catch (err) {
    return { exito: false, mensaje: err.message };
  }
}

/**
 * Obtiene el usuario autenticado en tiempo real desde Supabase
 */
async function supabaseObtenerUsuarioActual() {
  const client = obtenerClienteSupabase();
  if (!client) return null;

  try {
    const { data } = await client.auth.getUser();
    return data && data.user ? data.user : null;
  } catch (e) {
    return null;
  }
}

/**
 * Escucha cambios en el estado de autenticación de Supabase (SIGNED_IN, SIGNED_OUT, etc.)
 */
function supabaseEscucharCambiosAuth(callback) {
  const client = obtenerClienteSupabase();
  if (!client || typeof callback !== "function") return null;

  try {
    const { data } = client.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return data && data.subscription ? data.subscription : null;
  } catch (err) {
    console.warn("[Supabase] Error al escuchar cambios de Auth:", err);
    return null;
  }
}

/**
 * Comprueba si un correo cuenta con aprobación manual en la tabla public.administradores
 */
async function supabaseVerificarAdminAprobado(email) {
  const client = obtenerClienteSupabase();
  if (!client || !email) {
    return { verificado: false, aprobado: false, motivo: "Sin cliente Supabase" };
  }

  try {
    const emailNorm = email.trim().toLowerCase();
    const { data, error } = await client
      .from("administradores")
      .select("id, email, rol, aprobado")
      .eq("email", emailNorm)
      .maybeSingle();

    if (error) {
      console.warn("[Supabase] Aviso al consultar tabla administradores:", error);
      // Si la tabla aún no fue creada en PostgreSQL, informamos para no bloquear catastróficamente
      return { verificado: false, aprobado: true, tablaInexistente: true };
    }

    if (!data) {
      // Si no existe fila para este correo, registramos la solicitud en pendiente
      try {
        await client.from("administradores").insert({
          email: emailNorm,
          aprobado: false
        });
      } catch (e) {
        // Ignorar colisión
      }
      return { verificado: true, aprobado: false, nuevo: true };
    }

    return {
      verificado: true,
      aprobado: Boolean(data.aprobado),
      rol: data.rol || "admin"
    };
  } catch (err) {
    console.error("[Supabase] Error en supabaseVerificarAdminAprobado:", err);
    return { verificado: false, aprobado: false, error: err.message };
  }
}

/**
 * Obtiene la lista completa de administradores y solicitudes de acceso
 */
async function supabaseObtenerListaAdmins() {
  const client = obtenerClienteSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from("administradores")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[Supabase] Error al listar administradores:", error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error("[Supabase] Excepción al listar administradores:", e);
    return [];
  }
}

/**
 * Aprueba o revoca el acceso de un administrador en Supabase
 */
async function supabaseActualizarEstadoAdmin(id, aprobado, aprobadoPor = "admin") {
  const client = obtenerClienteSupabase();
  if (!client) return { exito: false, mensaje: "Supabase no conectado" };

  try {
    const { data, error } = await client
      .from("administradores")
      .update({
        aprobado: Boolean(aprobado),
        aprobado_por: aprobadoPor
      })
      .eq("id", id)
      .select();

    if (error) {
      return { exito: false, mensaje: error.message };
    }
    return { exito: true, data };
  } catch (err) {
    return { exito: false, mensaje: err.message };
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
        contentType: archivo.type || (extension === "webp" ? "image/webp" : "image/jpeg"),
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
 * Sube un archivo de comprobante de pago al bucket "comprobantes-transferencia"
 */
async function supabaseSubirComprobanteTransferencia(archivo, codigoPedido = "pedido") {
  const client = obtenerClienteSupabase();
  if (!client || !archivo) return null;

  try {
    const extension = (archivo.name.split(".").pop() || "jpg").toLowerCase();
    const nombreLimpio = archivo.name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
    const nombreUnico = `comp_${Date.now()}_${codigoPedido}_${nombreLimpio}.${extension}`;

    const { data, error } = await client.storage
      .from("comprobantes-transferencia")
      .upload(nombreUnico, archivo, {
        cacheControl: "3600",
        contentType: archivo.type || (extension === "pdf" ? "application/pdf" : (extension === "webp" ? "image/webp" : "image/jpeg")),
        upsert: true
      });

    if (error) {
      console.error("[Supabase Storage] Error al subir comprobante:", error);
      return null;
    }

    const { data: publicData } = client.storage
      .from("comprobantes-transferencia")
      .getPublicUrl(nombreUnico);

    return publicData && publicData.publicUrl ? publicData.publicUrl : nombreUnico;
  } catch (err) {
    console.error("[Supabase Storage] Excepción al subir comprobante:", err);
    return null;
  }
}

/**
 * Sube un archivo de moldería (PDF, ZIP, etc.) al bucket privado "moldes-archivos"
 * Solo permitido para administradores aprobados.
 */
async function supabaseSubirArchivoMolde(archivo, nombreMolde = "molde") {
  const client = obtenerClienteSupabase();
  if (!client || !archivo) return null;

  try {
    const extension = (archivo.name.split(".").pop() || "pdf").toLowerCase();
    const nombreLimpio = (nombreMolde || archivo.name).replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
    const nombreUnico = `patron_${Date.now()}_${nombreLimpio}.${extension}`;

    const { data, error } = await client.storage
      .from("moldes-archivos")
      .upload(nombreUnico, archivo, {
        cacheControl: "3600",
        contentType: archivo.type || (extension === "pdf" ? "application/pdf" : "application/zip"),
        upsert: true
      });

    if (error) {
      const esTamano = error.message && (error.message.toLowerCase().includes("size") || error.message.toLowerCase().includes("maximum"));
      if (esTamano) {
        console.error(`[Supabase Storage] El archivo "${archivo.name}" (${(archivo.size / 1024 / 1024).toFixed(1)} MB) supera el tamaño máximo permitido en el bucket. Reducí el PDF o ajustá el límite en Supabase → Storage → Policies.`);
      } else {
        console.error("[Supabase Storage] Error al subir archivo de moldería:", error);
      }
      return null;
    }

    return nombreUnico;
  } catch (err) {
    console.error("[Supabase Storage] Excepción al subir archivo de molde:", err);
    return null;
  }
}

/**
 * Sube un archivo de especificaciones / recomendaciones (PDF, ZIP, etc.) al bucket privado "moldes-archivos"
 * Solo permitido para administradores aprobados.
 */
async function supabaseSubirArchivoSpecs(archivo, nombreMolde = "especificaciones") {
  const client = obtenerClienteSupabase();
  if (!client || !archivo) return null;

  try {
    const extension = (archivo.name.split(".").pop() || "pdf").toLowerCase();
    const nombreLimpio = (nombreMolde || archivo.name).replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
    const nombreUnico = `specs_${Date.now()}_${nombreLimpio}.${extension}`;

    const { data, error } = await client.storage
      .from("moldes-archivos")
      .upload(nombreUnico, archivo, {
        cacheControl: "3600",
        contentType: archivo.type || (extension === "pdf" ? "application/pdf" : "application/zip"),
        upsert: true
      });

    if (error) {
      const esTamano = error.message && (error.message.toLowerCase().includes("size") || error.message.toLowerCase().includes("maximum"));
      if (esTamano) {
        console.error(`[Supabase Storage] El archivo de especificaciones "${archivo.name}" (${(archivo.size / 1024 / 1024).toFixed(1)} MB) supera el tamaño máximo permitido en el bucket.`);
      } else {
        console.error("[Supabase Storage] Error al subir archivo de especificaciones:", error);
      }
      return null;
    }

    return nombreUnico;
  } catch (err) {
    console.error("[Supabase Storage] Excepción al subir archivo de especificaciones:", err);
    return null;
  }
}

/**
 * Genera una URL firmada de descarga temporal para un molde del bucket privado "moldes-archivos"
 */
async function supabaseObtenerUrlDescargaMolde(archivoUrlOPath, segundosValidez = 86400) {
  if (!archivoUrlOPath || typeof archivoUrlOPath !== "string") return null;

  // Si es Data URL o Blob URL (respaldo local), se devuelve directo
  if (archivoUrlOPath.startsWith("data:") || archivoUrlOPath.startsWith("blob:")) {
    return archivoUrlOPath;
  }

  // Si es un enlace externo que no pertenece a nuestro bucket de Supabase, se devuelve directo
  if ((archivoUrlOPath.startsWith("http://") || archivoUrlOPath.startsWith("https://")) && !archivoUrlOPath.includes("/moldes-archivos/")) {
    return archivoUrlOPath;
  }

  const client = obtenerClienteSupabase();
  if (!client) return null;

  try {
    let ruta = archivoUrlOPath.split("?")[0].trim();
    if (ruta.includes("/moldes-archivos/")) {
      ruta = ruta.split("/moldes-archivos/").pop();
    }
    ruta = ruta.replace(/^moldes-archivos\//, "").replace(/^\/+/, "");

    const { data, error } = await client.storage
      .from("moldes-archivos")
      .createSignedUrl(ruta, segundosValidez, { download: true });

    if (error || !data || !data.signedUrl) {
      console.warn("[Supabase Storage] No se pudo generar URL firmada para molde:", error);
      return null;
    }

    let urlFinal = data.signedUrl;
    // Si la URL retornada por supabase-js es relativa (/storage/v1/...), anteponer la URL base del proyecto
    if (urlFinal.startsWith("/")) {
      const creds = obtenerCredencialesSupabase();
      const baseUrl = creds && creds.url ? creds.url.replace(/\/+$/, "") : "";
      urlFinal = `${baseUrl}${urlFinal}`;
    }

    // Asegurar parámetro de descarga automática para el navegador
    if (!urlFinal.includes("download=")) {
      urlFinal += (urlFinal.includes("?") ? "&" : "?") + "download=";
    }

    return urlFinal;
  } catch (err) {
    console.warn("[Supabase Storage] Error solicitando URL de descarga:", err);
    return null;
  }
}

/**
 * Obtiene una URL accesible para previsualizar un comprobante bancario.
 * Si es un archivo en el bucket privado de Supabase y el administrador está logueado, genera una URL firmada segura.
 */
async function supabaseObtenerUrlComprobante(urlOPath) {
  if (!urlOPath || typeof urlOPath !== "string") return null;

  // Si es un data URL (base64) o un enlace externo ajeno a nuestro storage, se devuelve directo
  if (urlOPath.startsWith("data:") || (!urlOPath.includes("comprobantes-transferencia") && !urlOPath.startsWith("comp_"))) {
    return urlOPath;
  }

  const client = obtenerClienteSupabase();
  if (!client) return urlOPath;

  try {
    let ruta = urlOPath;
    if (ruta.includes("/comprobantes-transferencia/")) {
      ruta = ruta.split("/comprobantes-transferencia/").pop();
    }
    ruta = ruta.split("?")[0].trim();

    // Generamos URL firmada con 1 hora de validez (3600 segundos)
    const { data, error } = await client.storage
      .from("comprobantes-transferencia")
      .createSignedUrl(ruta, 3600);

    if (error || !data || !data.signedUrl) {
      console.warn("[Supabase Storage] No se pudo generar URL firmada para comprobante:", error);
      return urlOPath;
    }

    return data.signedUrl;
  } catch (err) {
    console.warn("[Supabase Storage] Error al solicitar URL firmada:", err);
    return urlOPath;
  }
}

/**
 * ====================================================================
 * 4. SERVICIOS DEL CATÁLOGO DE PRODUCTOS (MOLDES)
 * ====================================================================
 */

/**
 * Obtiene todos los moldes desde Supabase (con fallback a null)
 * Oculta defensivamente los enlaces de descarga directa (Google Drive y videos) si no hay sesión de admin activa.
 */
async function supabaseObtenerProductos() {
  const client = obtenerClienteSupabase();
  if (!client) {
    return null;
  }

  try {
    const esAdmin = typeof estaAdminLogueado === "function" && estaAdminLogueado();
    const colsPublicas = "id, nombre, descripcion, categoria, icono, precio, en_promo, precio_promo, precio_usd, precio_promo_usd, imagen, imagenes, es_gratuito, created_at";
    const colsPublicasBase = "id, nombre, descripcion, categoria, icono, precio, en_promo, precio_promo, precio_usd, precio_promo_usd, imagen, es_gratuito, created_at";
    const columnas = esAdmin ? "*" : colsPublicas;

    let res = await client
      .from("productos")
      .select(columnas)
      .order("id", { ascending: true });

    // Si hubo error con '*' o con colsPublicas (por ejemplo si la columna imagenes no existe aún en PostgreSQL), reintentamos con colsPublicasBase
    if (res.error) {
      console.warn("[Supabase] Aviso al consultar productos con columnas extendidas, reintentando con base:", res.error.message);
      res = await client
        .from("productos")
        .select(colsPublicasBase)
        .order("id", { ascending: true });
    }

    if (res.error) {
      console.error("[Supabase] Error al consultar productos:", res.error);
      return null;
    }

    const data = res.data;

    // Mapeamos de snake_case (BD) a camelCase (UI)
    return (data || []).map(p => {
      let imagenesArray = Array.isArray(p.imagenes)
        ? p.imagenes
        : (p.imagen ? [p.imagen] : []);
      const imagenPrincipal = imagenesArray.length > 0
        ? imagenesArray[0]
        : (p.imagen || null);

      let archUrl = p.archivo_url || null;
      let specsUrl = p.archivo_specs_url || null;

      // Si link_archivos contiene JSON empaquetado (molde + specs):
      if (typeof p.link_archivos === "string" && p.link_archivos.startsWith("{")) {
        try {
          const parsed = JSON.parse(p.link_archivos);
          if (!archUrl) archUrl = parsed.molde || "";
          if (!specsUrl) specsUrl = parsed.specs || "";
        } catch (e) {}
      }

      return {
        id: Number(p.id),
        nombre: p.nombre,
        descripcion: p.descripcion,
        categoria: p.categoria || "Otros",
        icono: p.icono || "scissors",
        precio: Number(p.precio),
        enPromo: Boolean(p.en_promo),
        precioPromo: Number(p.precio_promo || 0),
        precioUsd: Number(p.precio_usd || 0),
        precioPromoUsd: Number(p.precio_promo_usd || 0),
        imagen: imagenPrincipal,
        imagenes: imagenesArray,
        archivoUrl: archUrl,
        archivoSpecsUrl: specsUrl,
        esGratuito: Boolean(p.es_gratuito),
        linkArchivos: archUrl || p.link_archivos || "",
        linkVideo: p.link_video || ""
      };
    });
  } catch (err) {
    console.error("[Supabase] Excepción al obtener productos:", err);
    return null;
  }
}

/**
 * Guarda o actualiza un molde en Supabase
 */
async function supabaseGuardarProducto(producto, esNuevo = false) {
  const client = obtenerClienteSupabase();
  if (!client) return false;

  const imagenesArray = Array.isArray(producto.imagenes)
    ? producto.imagenes
    : (producto.imagen ? [producto.imagen] : []);
  const imagenPrincipal = imagenesArray.length > 0
    ? imagenesArray[0]
    : (producto.imagen || null);

  // Link de archivos con serialización de molde y especificaciones por si no existe aún la columna en BD
  let linkArchivosSerializado = producto.linkArchivos || producto.archivoUrl || "";
  if (producto.archivoSpecsUrl) {
    linkArchivosSerializado = JSON.stringify({
      molde: producto.archivoUrl || producto.linkArchivos || "",
      specs: producto.archivoSpecsUrl
    });
  }

  const payloadCompleto = {
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    categoria: producto.categoria,
    icono: producto.icono,
    precio: producto.precio,
    en_promo: producto.enPromo,
    precio_promo: producto.precioPromo,
    precio_usd: Number(producto.precioUsd || 0),
    precio_promo_usd: Number(producto.precioPromoUsd || 0),
    imagen: imagenPrincipal,
    imagenes: imagenesArray,
    archivo_url: producto.archivoUrl || null,
    archivo_specs_url: producto.archivoSpecsUrl || null,
    es_gratuito: Boolean(producto.esGratuito),
    link_archivos: linkArchivosSerializado,
    link_video: producto.linkVideo || ""
  };

  const payloadBase = {
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    categoria: producto.categoria,
    icono: producto.icono,
    precio: producto.precio,
    en_promo: producto.enPromo,
    precio_promo: producto.precioPromo,
    precio_usd: Number(producto.precioUsd || 0),
    precio_promo_usd: Number(producto.precioPromoUsd || 0),
    imagen: imagenPrincipal,
    archivo_url: producto.archivoUrl || null,
    es_gratuito: Boolean(producto.esGratuito),
    link_archivos: linkArchivosSerializado,
    link_video: producto.linkVideo || ""
  };

  try {
    let fueActualizado = false;

    // Solo intentamos actualizar si NO es un molde nuevo y tiene ID asignado
    if (!esNuevo && producto.id && producto.id > 0) {
      const { data: existente } = await client
        .from("productos")
        .select("id")
        .eq("id", producto.id)
        .maybeSingle();

      if (existente && existente.id) {
        let { error: errorUpdate } = await client
          .from("productos")
          .update(payloadCompleto)
          .eq("id", producto.id);

        // Si falló por columnas extendidas inexistentes (imagenes o archivo_specs_url), reintentar con base
        if (errorUpdate) {
          console.warn("[Supabase] Reintentando actualización de producto con payload base:", errorUpdate.message);
          const { error: errorUpdateBase } = await client
            .from("productos")
            .update(payloadBase)
            .eq("id", producto.id);

          if (errorUpdateBase) throw errorUpdateBase;
        }
        fueActualizado = true;
      }
    }

    // Si es nuevo o no existía previamente en la base de datos de Supabase, lo insertamos
    if (!fueActualizado) {
      let { data: dataInsert, error: errorInsert } = await client
        .from("productos")
        .insert([payloadCompleto])
        .select()
        .single();

      // Si falló la inserción completa, reintentar con payload base
      if (errorInsert) {
        console.warn("[Supabase] Reintentando inserción de producto con payload base:", errorInsert.message);
        const resBase = await client
          .from("productos")
          .insert([payloadBase])
          .select()
          .single();

        if (resBase.error) throw resBase.error;
        dataInsert = resBase.data;
      }

      if (dataInsert && dataInsert.id) {
        producto.id = Number(dataInsert.id);
      }
    }

    console.log(`[Supabase] ✓ Molde "${producto.nombre}" guardado exitosamente en la base de datos.`);
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
        moneda,
        metodo_pago,
        estado,
        archivos_enviados,
        fecha_envio_archivos,
        comprobante_url,
        numero_operacion,
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
      moneda: p.moneda || "ARS",
      metodoPago: p.metodo_pago || "transferencia",
      estado: p.estado,
      archivosEnviados: Boolean(p.archivos_enviados),
      fechaEnvioArchivos: p.fecha_envio_archivos || null,
      comprobanteUrl: p.comprobante_url || null,
      numeroOperacion: p.numero_operacion || null,
      items: (p.pedido_items || []).map(it => {
        let archUrl = it.link_archivos || "";
        let specsUrl = "";
        if (typeof it.link_archivos === "string" && it.link_archivos.startsWith("{")) {
          try {
            const parsed = JSON.parse(it.link_archivos);
            archUrl = parsed.molde || parsed.archivoUrl || "";
            specsUrl = parsed.specs || parsed.archivoSpecsUrl || "";
          } catch (e) {}
        }
        return {
          id: it.producto_id || it.id,
          nombre: it.nombre,
          precio: Number(it.precio),
          cantidad: Number(it.cantidad || 1),
          archivoUrl: archUrl,
          archivoSpecsUrl: specsUrl,
          linkArchivos: archUrl,
          linkVideo: it.link_video || ""
        };
      })
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
    const itemsNormalizados = (pedido.items || []).map(item => {
      let linkArchivos = item.archivoUrl || item.linkArchivos || "";
      if (item.archivoSpecsUrl) {
        linkArchivos = JSON.stringify({
          molde: item.archivoUrl || item.linkArchivos || "",
          specs: item.archivoSpecsUrl
        });
      }
      return {
        producto_id: item.id && item.id > 0 ? item.id : null,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad || 1,
        archivo_url: item.archivoUrl || item.archivo_url || null,
        archivo_specs_url: item.archivoSpecsUrl || item.archivo_specs_url || null,
        link_archivos: linkArchivos,
        link_video: item.linkVideo || ""
      };
    });

    const cabeceraPayload = {
      codigo: pedido.codigo,
      fecha_texto: pedido.fecha,
      cliente_nombre: pedido.cliente.nombre,
      cliente_email: pedido.cliente.email,
      cliente_telefono: pedido.cliente.telefono || "No especificado",
      total: pedido.total,
      moneda: pedido.moneda || "ARS",
      metodo_pago: pedido.metodoPago || "transferencia",
      estado: pedido.estado || "pendiente",
      archivos_enviados: Boolean(pedido.archivosEnviados),
      fecha_envio_archivos: pedido.fechaEnvioArchivos || null,
      comprobante_url: pedido.comprobanteUrl || null,
      numero_operacion: pedido.numeroOperacion || null
    };

    // 1. Intentamos registrar vía RPC atómica y segura si está disponible
    try {
      const { data: rpcData, error: rpcError } = await client.rpc("registrar_pedido_checkout", {
        p_pedido: cabeceraPayload,
        p_items: itemsNormalizados
      });

      if (!rpcError && rpcData && rpcData.exito) {
        if (rpcData.id) pedido.id = Number(rpcData.id);
        console.log(`[Supabase] ✓ Pedido ${pedido.codigo} registrado exitosamente vía RPC registrar_pedido_checkout.`);
        return true;
      }
      if (rpcError) {
        console.warn("[Supabase] Aviso en RPC registrar_pedido_checkout, probando inserción directa:", rpcError.message);
      }
    } catch (eRpc) {
      console.warn("[Supabase] Fallback directo a tablas tras excepción en RPC:", eRpc);
    }

    // 2. Inserción directa en tabla pedidos
    let nuevoPedidoId = null;

    const { data: pedidoData, error: pedidoError } = await client
      .from("pedidos")
      .insert([cabeceraPayload])
      .select("id")
      .maybeSingle();

    if (!pedidoError && pedidoData && pedidoData.id) {
      nuevoPedidoId = pedidoData.id;
      pedido.id = Number(nuevoPedidoId);
    } else {
      // Reintento sin select por si RLS bloquea lectura en visitantes anónimos
      const { error: insertSimpleError } = await client
        .from("pedidos")
        .insert([cabeceraPayload]);

      if (insertSimpleError) throw insertSimpleError;

      // Intentar obtener el ID mediante RPC de consulta
      try {
        const { data: resDesc } = await client.rpc("obtener_descargas_pedido", {
          p_codigo: pedido.codigo,
          p_email: pedido.cliente.email
        });
        if (resDesc && resDesc.id) {
          nuevoPedidoId = resDesc.id;
          pedido.id = Number(nuevoPedidoId);
        }
      } catch (eId) {}
    }

    // 3. Inserción de ítems en pedido_items (si obtuvimos el ID del pedido)
    if (nuevoPedidoId && itemsNormalizados.length > 0) {
      // Intento A: Payload completo con columnas extendidas (archivo_url y archivo_specs_url)
      const itemsPayloadCompleto = itemsNormalizados.map(it => ({
        pedido_id: nuevoPedidoId,
        producto_id: it.producto_id,
        nombre: it.nombre,
        precio: it.precio,
        cantidad: it.cantidad,
        archivo_url: it.archivo_url,
        archivo_specs_url: it.archivo_specs_url,
        link_archivos: it.link_archivos,
        link_video: it.link_video
      }));

      const { error: itemsError } = await client
        .from("pedido_items")
        .insert(itemsPayloadCompleto);

      if (itemsError) {
        console.warn("[Supabase] Aviso al insertar pedido_items completo, reintentando con columnas base garantizadas:", itemsError.message);
        
        // Intento B: Payload base garantizado (omitiendo archivo_url y archivo_specs_url inexistentes, ya serializados en link_archivos)
        const itemsPayloadBase = itemsNormalizados.map(it => ({
          pedido_id: nuevoPedidoId,
          producto_id: it.producto_id,
          nombre: it.nombre,
          precio: it.precio,
          cantidad: it.cantidad,
          link_archivos: it.link_archivos,
          link_video: it.link_video
        }));

        const { error: retryErrorBase } = await client
          .from("pedido_items")
          .insert(itemsPayloadBase);

        if (retryErrorBase) {
          console.warn("[Supabase] Reintentando pedido_items sin clave foránea de producto:", retryErrorBase.message);
          // Intento C: Sin foreign key producto_id por si el producto aún no se insertó en Supabase
          const itemsSinFk = itemsPayloadBase.map(it => ({ ...it, producto_id: null }));
          const { error: retryErrorFinal } = await client
            .from("pedido_items")
            .insert(itemsSinFk);

          if (retryErrorFinal) {
            console.error("[Supabase] Error final al registrar pedido_items:", retryErrorFinal);
          }
        }
      }
    }

    console.log(`[Supabase] ✓ Pedido ${pedido.codigo} registrado exitosamente.`);
    return true;
  } catch (err) {
    console.error("[Supabase] Error al crear pedido:", err);
    return false;
  }
}

/**
 * Actualiza el estado y fecha de entrega de archivos de un pedido en Supabase
 * Admite tanto el ID numérico de base de datos como el código de pedido ("ORD-XXXX")
 */
async function supabaseActualizarEstadoPedido(pedidoIdOCodigo, nuevoEstado, archivosEnviados = null, fechaEnvioArchivos = null) {
  const client = obtenerClienteSupabase();
  if (!client || !pedidoIdOCodigo) return false;

  const payload = { estado: nuevoEstado };
  if (archivosEnviados !== null) payload.archivos_enviados = Boolean(archivosEnviados);
  if (fechaEnvioArchivos !== null) payload.fecha_envio_archivos = fechaEnvioArchivos;

  try {
    let query = client.from("pedidos").update(payload);

    if (typeof pedidoIdOCodigo === "string" && pedidoIdOCodigo.startsWith("ORD-")) {
      query = query.eq("codigo", pedidoIdOCodigo);
    } else if (typeof pedidoIdOCodigo === "number" || (!isNaN(Number(pedidoIdOCodigo)) && Number(pedidoIdOCodigo) < 1000000000)) {
      query = query.eq("id", Number(pedidoIdOCodigo));
    } else {
      query = query.eq("codigo", String(pedidoIdOCodigo));
    }

    const { error } = await query;
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("[Supabase] Error al actualizar pedido:", err);
    return false;
  }
}

/**
 * Marca un pedido como completado tras la aprobación de pago en Mercado Pago
 * Utiliza la función RPC con SECURITY DEFINER para que funcione incluso para visitantes anónimos
 */
async function supabaseMarcarPedidoCompletadoMP(codigo, numeroOperacion = null) {
  const client = obtenerClienteSupabase();
  if (!client || !codigo) return false;

  try {
    // 1. Intentamos invocar la función RPC segura
    const { error: rpcError } = await client.rpc("marcar_pedido_completado_mp", {
      p_codigo: String(codigo),
      p_numero_operacion: numeroOperacion ? String(numeroOperacion) : null
    });

    if (!rpcError) {
      console.log(`[Supabase] ✓ Pedido ${codigo} completado vía RPC marcar_pedido_completado_mp.`);
      return true;
    }

    // 2. Fallback a update directo si la RPC no estuviese creada
    console.warn("[Supabase] Fallback a update directo tras respuesta RPC:", rpcError.message);
    const { error: updateError } = await client
      .from("pedidos")
      .update({
        estado: "completada",
        numero_operacion: numeroOperacion ? String(numeroOperacion) : null
      })
      .eq("codigo", codigo);

    return !updateError;
  } catch (err) {
    console.warn("[Supabase] Error al marcar pedido completado:", err);
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

/**
 * Consulta de forma segura las descargas autorizadas de un pedido completado (RPC).
 * Si contiene archivos en el bucket privado, genera URLs firmadas temporales para cada uno.
 */
async function supabaseObtenerDescargasPedido(codigo, email) {
  const client = obtenerClienteSupabase();
  if (!client || !codigo || !email) return null;

  try {
    const { data, error } = await client.rpc("obtener_descargas_pedido", {
      p_codigo: codigo.trim(),
      p_email: email.trim().toLowerCase()
    });

    if (error) {
      console.error("[Supabase] Error al consultar descargas de pedido:", error);
      return null;
    }

    if (!data || !data.encontrado) {
      return data || { encontrado: false, estado: "inexistente" };
    }

    // Si el pedido está completado y tiene ítems, resolvemos las URLs de descarga
    if (data.estado === "completada" && Array.isArray(data.items)) {
      for (const item of data.items) {
        // Desempaquetar si viene en formato JSON dentro de link_archivos
        if (typeof item.link_archivos === "string" && item.link_archivos.startsWith("{")) {
          try {
            const parsed = JSON.parse(item.link_archivos);
            if (!item.archivo_url) item.archivo_url = parsed.molde || "";
            if (!item.archivo_specs_url) item.archivo_specs_url = parsed.specs || "";
          } catch (e) {}
        }

        // 1. URL de descarga para el molde principal
        const rutaMolde = item.archivo_url || item.link_archivos;
        if (rutaMolde && typeof supabaseObtenerUrlDescargaMolde === "function" && (rutaMolde.includes("/") || rutaMolde.endsWith(".pdf") || rutaMolde.endsWith(".zip") || rutaMolde.startsWith("patron_"))) {
          const urlFirmada = await supabaseObtenerUrlDescargaMolde(rutaMolde, 86400);
          item.linkDescarga = urlFirmada || rutaMolde || "";
        } else {
          item.linkDescarga = item.link_archivos || item.archivo_url || "";
        }

        // 2. URL de descarga para el archivo de especificaciones y materiales
        const rutaSpecs = item.archivo_specs_url;
        if (rutaSpecs && typeof supabaseObtenerUrlDescargaMolde === "function" && (rutaSpecs.includes("/") || rutaSpecs.endsWith(".pdf") || rutaSpecs.endsWith(".zip") || rutaSpecs.startsWith("specs_"))) {
          const urlFirmadaSpecs = await supabaseObtenerUrlDescargaMolde(rutaSpecs, 86400);
          item.linkSpecs = urlFirmadaSpecs || rutaSpecs || "";
        } else {
          item.linkSpecs = item.archivo_specs_url || "";
        }
      }
    }

    return data;
  } catch (err) {
    console.error("[Supabase] Excepción en obtener_descargas_pedido:", err);
    return null;
  }
}

/**
 * Aprueba una transferencia bancaria desde el panel de administración usando la RPC de seguridad
 */
async function supabaseAprobarPedidoTransferencia(codigo) {
  const client = obtenerClienteSupabase();
  if (!client || !codigo) return false;

  try {
    const { data, error } = await client.rpc("aprobar_pedido_transferencia", {
      p_codigo: codigo.trim()
    });

    if (error) {
      console.error("[Supabase] Error al aprobar pedido por transferencia:", error);
      // Fallback a actualización directa si es admin
      return await supabaseActualizarEstadoPedido(codigo, "completada");
    }

    return Boolean(data);
  } catch (err) {
    console.error("[Supabase] Excepción al aprobar transferencia:", err);
    return false;
  }
}

/**
 * ====================================================================
 * 6. CONFIGURACIÓN GLOBAL DE LA TIENDA (TABLA tienda_config)
 * ====================================================================
 */

/**
 * Obtiene el valor JSON de una clave de configuración global de la tienda
 */
async function supabaseObtenerConfig(clave) {
  const client = obtenerClienteSupabase();
  if (!client || !clave) return null;

  try {
    const { data, error } = await client
      .from("tienda_config")
      .select("valor")
      .eq("clave", clave)
      .maybeSingle();

    if (error) {
      console.warn(`[Supabase] Error al consultar configuración '${clave}':`, error);
      return null;
    }
    return data ? data.valor : null;
  } catch (err) {
    console.warn(`[Supabase] Excepción al obtener configuración '${clave}':`, err);
    return null;
  }
}

/**
 * Guarda o actualiza un valor de configuración global (exclusivo para admins autenticados)
 */
async function supabaseGuardarConfig(clave, valor) {
  const client = obtenerClienteSupabase();
  if (!client || !clave) return false;

  try {
    const { error } = await client
      .from("tienda_config")
      .upsert({
        clave: clave,
        valor: valor,
        updated_at: new Date().toISOString()
      }, { onConflict: "clave" });

    if (error) {
      console.error(`[Supabase] Error al guardar configuración '${clave}':`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[Supabase] Excepción al guardar configuración '${clave}':`, err);
    return false;
  }
}
