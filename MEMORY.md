# MEMORY.md — Cosé con Giu - Tienda de Moldes Digitales
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

Última actualización: 18/11/2026 — Gestión dinámica de categorías en Panel Admin (agregar/eliminar con reasignación segura).

## Estado actual
- Gestión dinámica de categorías en Panel Admin:
  - Formulario de alta rápida de categorías con validación anti-duplicados.
  - Lista de categorías activas con conteo de moldes y botón de eliminación individual.
  - Reasignación defensiva automática a "Otros" al eliminar una categoría en uso (con confirmación).
  - Sincronización transparente en localStorage y tabla configuracion de Supabase (clave `categorias_moldes`).
  - Dropdown del formulario de moldes y chips del catálogo actualizados automáticamente.
- Estética Boutique estilo Tiendanube en toda la tienda (fuente Plus Jakarta Sans, Hero boutique, tarjetas alineadas).
  - Tipografía oficial: Plus Jakarta Sans (Google Fonts) con fallback nativo en system-ui.
  - Barra de anuncios superior con beneficios clave (A4, 10% OFF Transferencia, Entrega inmediata a Gmail).
  - Encabezado refinado con píldoras de navegación, enlace rápido a Preguntas y botón de carrito con insignia.
  - Portada Hero Boutique en el catálogo destacando la confección casera en A4 y video tutorial.
  - Tarjetas de moldes con esquinas redondeadas, elevación al hover, zoom suave en foto, badges flotantes (*Oferta*, *⭐ Más Vendido*), descripciones de altura uniforme (clamped 2 líneas) y píldora destacada de 10% OFF.
  - Selector de categorías dinámico en chips redondeados sin desbordes.
  - Footer con vitrina de medios de pago aceptados (Mercado Pago, Visa, Mastercard, Naranja, Transferencia, PayPal).
  - Íconos oficiales vectoriales en SVG para redes: WhatsApp (botón flotante y checkout), Instagram y YouTube.
- Checkout profesionalizado en 2 pasos sin sobrecarga ni scroll horizontal.
- Mercado Pago Checkout Pro y Supabase 100% operativos.

## Decisiones y por qué
- Estilo Tiendanube: Incrementa la confianza, la tasa de conversión y moderniza la presentación visual sin añadir frameworks pesados.
- Altura uniforme en descripciones con `-webkit-line-clamp`: Evita desfasajes en la grilla del catálogo.
- Vitrina de pagos en el pie de página: Transmite seguridad y claridad a los compradores antes de iniciar la compra.

## Aprendizajes y errores a evitar
- Mantener siempre la paleta oficial (`#845ec2`, `#c7a138`) para consistencia de marca.
- En CSS Grid dentro de modales o grillas, usar minmax(0, 1fr) y overflow-x: hidden para evitar desbordes horizontales.

## Próximos pasos
- Carga de fotos de moldes reales y enlaces a Google Drive por parte del administrador.
