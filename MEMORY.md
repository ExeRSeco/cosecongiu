# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 04/11/2026 — Checkout mejorado para transferencias, comprobantes adjuntos, visor en admin y datos bancarios editables.

## Estado actual
- Tienda desplegada y funcionando en producción en Vercel.
- Checkout optimizado para pago por transferencia:
  - Carga opcional recomendada de comprobante de pago (JPG, PNG o PDF hasta 5 MB).
  - Almacenamiento en bucket Supabase Storage `comprobantes-transferencia` con fallback local en Base64.
  - Campo para N° de operación bancaria.
  - Botones de copiado rápido de Alias y CBU/CVU con feedback visual.
  - Alerta destacada de entrega digital en un plazo máximo de 1 hora en checkout y modal de éxito.
- Panel de Administración:
  - Tarjeta de configuración bancaria editable (Banco, Titular, Alias, CBU, CUIT) sincronizada con Supabase (`tienda_config`) y `localStorage`.
  - Tarjetas de pedidos con badges de N° de operación y comprobante.
  - Modal visor de comprobantes (`#modal-visor-comprobante`) para imágenes y PDFs.
- Autenticación administrativa exclusiva vía Supabase Auth con aprobación manual en tabla `administradores`.
- RLS blindado en Supabase para `productos`, `pedidos`, `tienda_config` y buckets de Storage.

## Decisiones y por qué
- Datos bancarios en `tienda_config`: Permite modificar Alias o CBU desde el admin sin tocar código ni redesplegar.
- Fallback Base64 para comprobantes: Permite operar sin interrupciones tanto en modo local como con Supabase Storage.
- Alerta de 1 hora: Reduce la ansiedad del comprador y refuerza la confianza tras la transferencia.

## Aprendizajes y errores a evitar
- Cumplir siempre las reglas de `local-dates` para fechas y horas en los pedidos.
- Comprobar límites de peso (5 MB) al procesar archivos de comprobantes antes de subirlos.

## Próximos pasos
- Envío automático de correo con API de mailing (ej. Resend / SendGrid) si se desea prescindir del cliente de correo nativo.
