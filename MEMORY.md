# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 17/11/2026 — Checkout rediseñado en 2 pasos limpios (estilo Atelier) + Supabase 100% migrado.

## Estado actual
- Checkout profesionalizado en 2 pasos claros:
  - Paso 1: Datos de entrega (Nombre, Gmail con nota sutil para Google Drive, WhatsApp).
  - Paso 2: Medio de pago (Mercado Pago instantáneo sin comprobantes redundantes, Transferencia con 10% OFF en grid limpio con copiado rápido, PayPal en USD).
- Base de datos Supabase al día: columnas de pagos agregadas, función RPC de confirmación activa y RLS optimizado sin recursión.
- Mercado Pago Checkout Pro 100% operativo con Serverless backend y webhook.
- Carrito con badges de confianza estilizados y catálogo limpio.

## Decisiones y por qué
- Checkout en 2 pasos: Elimina el scroll interminable y la sobrecarga cognitiva en compras móviles y de escritorio.
- Eliminación de campos redundantes en MP: Checkout Pro valida automáticamente sin pedir comprobantes manuales innecesarios.
- Paleta unificada: Se eliminaron cajas de colores estridentes por tarjetas neutras con acentos en lavanda y dorado oficial.

## Aprendizajes y errores a evitar
- Menos es más en microcopy: notas sutiles convierten mejor que advertencias extensas o restrictivas.
- No duplicar botones de acción en modales para evitar confusión de flujo.
- En CSS Grid dentro de modales, usar siempre minmax(0, 1fr) y overflow-x: hidden para evitar desbordes horizontales.

## Próximos pasos
- Carga de moldes reales y enlaces finales a Google Drive por parte del administrador.
