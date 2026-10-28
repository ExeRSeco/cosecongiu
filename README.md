# Tienda de Moldes Digitales — Cosé con Giu

Plataforma de comercio electrónico de alto rendimiento (SPA Vanilla Web Stack) para la venta y distribución de patrones de costura y moldes digitales en formato PDF.

---

## 🚀 Despliegue en Producción (Vercel / Netlify / Cloudflare Pages)

El proyecto está preparado para producción con costo $0 de hosting y base de datos:

### Opción A: Desplegar en Vercel (Recomendado)
1. Instala el CLI de Vercel (`npm i -g vercel`) o conecta tu repositorio de GitHub en [vercel.com](https://vercel.com).
2. Ejecuta `vercel` en la raíz del proyecto.
3. El archivo `vercel.json` ya incluye las cabeceras de seguridad HTTP y el enrutamiento SPA automático.

### Opción B: Desplegar en Netlify
1. Conecta tu repositorio en [netlify.com](https://netlify.com).
2. El archivo `netlify.toml` ya configura los encabezados y redirecciones automáticamente.

---

## 🗄️ Conectar Base de Datos en la Nube (Supabase)

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Ve al **SQL Editor** y ejecuta el script completo [`supabase-schema.sql`](file:///d:/Exe/archivos/PROYECTOS/Tienda%20de%20moldes/supabase-schema.sql). Esto creará:
   - Las tablas `productos`, `pedidos` y `pedido_items` con sus índices y políticas de seguridad RLS.
   - El bucket de almacenamiento público `moldes-imagenes` en Supabase Storage.
3. En la tienda web, ingresa al **Panel Admin** (`admin` / `giu2026`) y haz clic en el botón superior **"Modo Local (Respaldo)"**.
4. Pega tu **Project URL** y tu **Anon Key** (disponibles en *Settings → API* en Supabase) y haz clic en **Guardar y Conectar**.
5. ¡Listo! La tienda sincronizará automáticamente el catálogo, las fotos en la nube y las ventas en tiempo real.

> **Modo Respaldo:** Si Supabase no está configurado o no hay conexión a internet, la aplicación sigue funcionando de forma 100% autónoma utilizando `localStorage`.

---

## 🛠️ Ejecución Local

Para probar localmente mediante un servidor HTTP simple:

```bash
# Con Python
python -m http.server 8000

# O con Node.js
npx serve .
```

Abre `http://localhost:8000` en tu navegador.

---

## 🔑 Credenciales Demo del Panel Admin
- **Usuario:** `admin` (o correo configurado en Supabase Auth)
- **Contraseña:** `giu2026`

---

## 📦 Arquitectura de Producción
- **Frontend:** HTML5 Semántico, CSS3 nativo con diseño responsivo pulido para móviles (320px–768px), Vanilla JavaScript ES6+.
- **Iconografía:** Lucide Icons vía CDN.
- **Backend / Persistencia:** Supabase (PostgreSQL, Auth y Storage) con fallback transparente a Web Storage API.
- **SEO & Redes Sociales:** Open Graph tags, Twitter Card, `robots.txt` y `sitemap.xml`.
- **Seguridad:** Sanitización XSS obligatoria, cabeceras HTTP de protección (X-Content-Type-Options, X-Frame-Options, Referrer-Policy).
