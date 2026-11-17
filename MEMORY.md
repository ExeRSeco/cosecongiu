# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 17/11/2026 — Medios de pago múltiples: Mercado Pago (inmediato), Transferencia con 10% OFF (hasta 48 hs hábiles) y PayPal (USD manual).

## Estado actual
- Medios de pago y checkout tri-modal completado:
  - **Mercado Pago:** Cobro en ARS con dinero en cuenta, tarjetas o alias/link, con acreditación y entrega inmediata.
  - **Transferencia Bancaria:** 10% de descuento automático en el total a transferir, con aviso explícito en checkout, detalle de producto, confirmación y WhatsApp de demora de **hasta 48 horas hábiles** por conciliación bancaria.
  - **PayPal Internacional:** Cobro en USD con precio manual por molde (`precioUsd` / `precioPromoUsd`) para clientes del exterior.
- Precios y descuentos visibles en catálogo (`renderCatalogo`), detalle (`verDetalleProducto`), carrito y checkout con desglose detallado.
- Panel Admin actualizado: configuración editable de alias/link de Mercado Pago, CBU/CVU bancario y PayPal; métricas en ARS y USD; gestión de ventas con badges diferenciados.
- Esquema de base de datos (`supabase-schema.sql`) y conector (`supabase.js`) con soporte idempotente para `metodo_pago`, `moneda`, `precio_usd` y `precio_promo_usd`.

## Decisiones y por qué
- 10% OFF en Transferencia: Incentiva el pago directo sin comisiones de pasarelas, compensando la espera de verificación bancaria.
- Aviso de 48 hs hábiles: Gestiona expectativas del comprador de patrones de costura, evitando reclamos inmediatos en pagos por transferencia.
- Precios en USD manuales: Permite controlar márgenes comerciales para ventas internacionales en PayPal sin depender de tasas de cambio volátiles.
- Compresión client-side en Canvas: Mantiene fotos de comprobantes y moldes optimizadas (85-98% ahorro) cuidando el 1 GB de Supabase.

## Aprendizajes y errores a evitar
- El descuento del 10% solo aplica si el método seleccionado es estrictamente transferencia.
- Fechas locales: usar siempre `getFullYear()`, `getMonth()` y `getDate()`, sin `toISOString()` ni cálculos en milisegundos.
- Mantener las dropzones sincronizadas en los 3 métodos de pago para evitar inconsistencias al adjuntar comprobantes.

## Próximos pasos
- Carga de moldes reales y enlaces finales a carpetas de Google Drive por parte del administrador.
