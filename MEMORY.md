# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 22/11/2026 — Promo 10% OFF en admin, retiro de 10% transfer y resolución de vulnerabilidades.

## Estado actual
- Precios y Promociones: Retirado el descuento automático del 10% por transferencia bancaria. Añadida la opción "10% OFF" al dropdown de promociones (`#producto-promo`), que calcula automáticamente el precio rebajado en tiempo real.
- Panel Admin 50/50 blindado: "Agregar/Editar Molde" y "Moldes en Catálogo" con `min-width: 0; width: 100%;` en grid simétrica, evitando cualquier desborde al editar o cargar PDFs.
- Seguridad y Vulnerabilidades:
  - SQL: RLS reforzado en `pedidos` y `moldes-archivos` para proteger PII y acceso a PDFs; `es_admin_aprobado` y trigger corregidos para evitar auto-aprobación no autorizada.
  - XSS y Sanitización: Reemplazado paso de strings en `onclick` inline por `verComprobantePorId(id)`; sanitización de URLs seguras (`esUrlSegura`).
  - Códigos de pedido: Implementado `generarCodigoPedido()` con base36 y entropía aleatoria para evitar colisiones en PostgreSQL.
  - Serverless: `api/crear-preferencia.js` verifica precios oficiales contra Supabase; `api/enviar-email.js` valida existencia del pedido y sanitiza HTML.
  - CDN y CSP: Versiones fijadas de Lucide y Supabase JS; sincronización de dominios Mercado Pago en `netlify.toml`.
- Subida y descarga dual de archivos PDF por molde (Molde + Especificaciones).

## Decisiones y por qué
- Opción 10% OFF en producto: Permite a Giu aplicar promociones del 10% a nivel catálogo a los moldes que desee, sin atar los descuentos de forma global al método de pago por transferencia.
- Función `verComprobantePorId`: Elimina la inyección de atributos HTML en renderizado dinámico al no interpolar URLs o textos directamente en `onclick`.
- Verificación de precios en backend: Previene la manipulación de precios desde las herramientas de desarrollador del navegador en el checkout de Mercado Pago.

## Aprendizajes y errores a evitar
- Los atributos inline `onclick="..."` decodifican entidades HTML (`&#39;`) antes de evaluar JavaScript, abriendo riesgo de escape de cadenas. Siempre invocar funciones por ID numérico.
- En CSS Grid con tablas o inputs, asignar siempre `min-width: 0` al contenedor para evitar que los elementos hijos rompan el ancho de las columnas.
