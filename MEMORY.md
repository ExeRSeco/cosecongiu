# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 22/11/2026 — Auditoría de seguridad SQL/API: cierre de auto-aprobación MP, RLS en moldes-archivos y verificar-pago.

## Estado actual
- Seguridad y Vulnerabilidades:
  - SQL: `marcar_pedido_completado_mp` revocado a `anon` (solo `service_role`/admin); `registrar_pedido_checkout` fuerza estado 'pendiente' para prevenir auto-aprobación en cliente.
  - Storage: Política RLS en `moldes-archivos` actualizada para permitir signed URLs a pedidos con `estado = 'completada'` o moldes gratuitos, resolviendo el bloqueo a compradores legítimos.
  - Mercado Pago: Creado endpoint serverless `api/verificar-pago.js` que valida cobros fácticos con la API oficial antes de aprobar pedidos en frontend.
  - Administradores: RLS en `public.administradores` limitado a usuario propio o admin aprobado; prevención de sobreescritura de `user_id` en trigger.
- Responsive Mobile & UI: Botón de carrito actualizado a icono `shopping-cart` + badge numérico (desktop y mobile). Elementos centrados en vista móvil (logo, chips de categorías, ordenamiento, contador y textos de tarjetas). Imágenes del catálogo en `aspect-ratio: 1 / 1` evitando recorte/zoom agresivo.
- Precios y Promociones: Retirado el descuento automático del 10% por transferencia bancaria. Añadida la opción "10% OFF" al dropdown de promociones (`#producto-promo`), que calcula automáticamente el precio rebajado en tiempo real.
- Panel Admin 50/50 blindado: "Agregar/Editar Molde" y "Moldes en Catálogo" con `min-width: 0; width: 100%;` en grid simétrica, evitando cualquier desborde al editar o cargar PDFs.
- Subida y descarga dual de archivos PDF por molde (Molde + Especificaciones).

## Decisiones y por qué
- Opción 10% OFF en producto: Permite a Giu aplicar promociones del 10% a nivel catálogo a los moldes que desee, sin atar los descuentos de forma global al método de pago por transferencia.
- Función `verComprobantePorId`: Elimina la inyección de atributos HTML en renderizado dinámico al no interpolar URLs o textos directamente en `onclick`.
- Verificación de precios en backend: Previene la manipulación de precios desde las herramientas de desarrollador del navegador en el checkout de Mercado Pago.

## Aprendizajes y errores a evitar
- Los atributos inline `onclick="..."` decodifican entidades HTML (`&#39;`) antes de evaluar JavaScript, abriendo riesgo de escape de cadenas. Siempre invocar funciones por ID numérico.
- En CSS Grid con tablas o inputs, asignar siempre `min-width: 0` al contenedor para evitar que los elementos hijos rompan el ancho de las columnas.
