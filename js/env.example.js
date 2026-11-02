// ====================================================================
// PLANTILLA DE VARIABLES DE ENTORNO PARA COSÉ CON GIU
// ====================================================================
// Para usar tus credenciales de Supabase en desarrollo o producción local:
// 1. Copia este archivo con el nombre 'js/env.js'
// 2. Reemplaza los valores con tu Project URL y Anon Key de Supabase
//    (Disponibles en: Supabase Dashboard -> Settings -> API)
// 3. Este archivo 'js/env.js' está excluido en .gitignore para proteger tus claves.
// ====================================================================

window.__ENV = {
  SUPABASE_URL: "https://tu-proyecto.supabase.co",
  SUPABASE_ANON_KEY: "tu-anon-key-aqui"
};
