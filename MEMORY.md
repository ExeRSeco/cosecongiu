# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 21/11/2026 — Ajuste de columnas admin 50/50 ("Agregar Molde" y "Moldes en Catálogo" con mismo tamaño).

## Estado actual
- Panel Admin: "Agregar Nuevo Molde" y "Moldes en Catálogo" tienen el mismo ancho (50% / 50% con `grid-template-columns: repeat(2, minmax(0, 1fr))`) para dar espacio cómodo a los formularios y subida dual de PDFs.
- Moldería de costura creativa: Sin talles en ningún componente, card, formulario ni modal.
- Catálogo en producción: Inicia limpio sin productos demo precargados (`PRODUCTOS_POR_DEFECTO = []`).
- Carrusel de fotos interactivo en tarjetas y vista detalle con miniaturas.
- Subida y descarga dual de archivos PDF por molde:
  - PDF 1: Molde (`archivo_url` en Supabase Storage `moldes-archivos`).
  - PDF 2: Especificaciones, materiales y recomendaciones (`archivo_specs_url`).
  - Botones de descarga independientes para Molde y Especificaciones en "Mis Descargas", modal gratuito y correos.
- Resiliencia y auto-reparación:
  - `supabaseCrearPedido`: intenta RPC atómica `registrar_pedido_checkout`; si fallan columnas extendidas, serializa molde y specs en `link_archivos` (JSON) y asegura inserción de ítems.
  - `supabaseObtenerProductos` y `supabaseGuardarProducto`: auto-reintento con columnas base si la migración de `imagenes` o `archivo_specs_url` aún no fue corrida en PostgreSQL.
  - `consultarDescargasDesdeModal`: si la BD devuelve 0 ítems por migración pendiente, auto-recupera del pedido local y genera URLs firmadas para ambos PDFs.
  - `enviarCorreoConfirmacion`: genera URLs firmadas con 7 días de validez y resuelve ítems locales si la orden en Supabase no los tenía.

## Decisiones y por qué
- Columnas Admin 50/50: Se cambió de `1fr 1.5fr` a `repeat(2, minmax(0, 1fr))` para que el formulario de carga tenga suficiente ancho y no se comprima la sección de subida de archivos ni los campos de precios.
- Sin talles: Los moldes de la marca corresponden a proyectos de costura creativa/accesorios sin graduación de talles de indumentaria.
- Serialización de respaldo en `link_archivos`: Permite almacenar tanto Molde como Especificaciones incluso si la base de datos no tiene las nuevas columnas agregadas.
- RPC `registrar_pedido_checkout`: Permite que visitantes anónimos inserten cabecera e ítems en una sola transacción sin problemas de RLS ni `RETURNING`.

## Aprendizajes y errores a evitar
- PostgREST devuelve PGRST204 cuando se intenta insertar columnas que no existen en el schema cache. Todo payload debe tener fallback limpiando columnas extendidas.
- En `obtener_descargas_pedido` y modales siempre resolver URLs firmadas para `archivo_specs_url` además de `archivo_url`.

## Próximos pasos
- Pegar y ejecutar el bloque SQL en Supabase Editor para habilitar `registrar_pedido_checkout`, `archivo_specs_url` e `imagenes` en PostgreSQL.
