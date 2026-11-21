# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 21/11/2026 — Carrusel de fotos, dualidad de PDFs (Molde + Especificaciones), sin talles y catálogo limpio.

## Estado actual
- Moldería de costura creativa: Sin talles en ningún componente, card, formulario ni modal.
- Catálogo en producción: Inicia limpio sin productos demo precargados (`PRODUCTOS_POR_DEFECTO = []`).
- Carrusel de fotos interactivo:
  - Soporte de múltiples imágenes por molde en panel admin con previsualización y eliminación individual.
  - Carrusel compacto en tarjeta de producto del catálogo con flechas stopPropagation y dots.
  - Visor boutique en vista/modal de detalle con imagen principal, contador 1/N y tira de miniaturas.
  - Specs simplificadas en detalle: sólo Formato (PDF A4), Guía (Materiales) y Video Tutorial (YouTube).
- Subida y descarga dual de archivos PDF por molde:
  - PDF 1: Molde / Patrón (`archivo_url` en Supabase Storage `moldes-archivos`).
  - PDF 2: Especificaciones, materiales y recomendaciones (`archivo_specs_url`).
  - Botones de descarga independientes para Molde y Especificaciones en "Mis Descargas", modal gratuito y correos.
- Persistencia & Seguridad:
  - Supabase Auth + RPC `obtener_descargas_pedido` y `aprobar_pedido_transferencia` con SECURITY DEFINER.
  - URLs firmadas temporales para descargas anónimas autorizadas. 31/31 tests automatizados aprobados.

## Decisiones y por qué
- Sin talles: Los moldes de la marca corresponden a proyectos de costura creativa/accesorios sin graduación de talles de indumentaria.
- Array `imagenes` con fallback a `imagen`: Garantiza retrocompatibilidad total con moldes precargados previamente.
- Dualidad de PDFs: Los clientes reciben por separado el trazado para imprimir (Molde) y la guía técnica (Especificaciones y Materiales).

## Aprendizajes y errores a evitar
- Correos universales: No restringir a `@gmail.com`; el sistema entrega descargas web directas y envía correos a cualquier dominio.
- En PowerShell encadenar comandos con `;` en lugar de `&&` para evitar SyntaxError.
- Subida de archivos en Supabase: usar `supabaseSubirArchivoMolde` para patrones y `supabaseSubirArchivoSpecs` para especificaciones.

## Próximos pasos
- Ejecutar la migración SQL en Supabase Editor para habilitar `imagenes` y `archivo_specs_url` en la base de datos PostgreSQL en la nube.
