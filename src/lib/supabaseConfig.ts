// Configuracion publica de Supabase, sin dependencias.
// Permite importar la URL y la clave anonima sin arrastrar el SDK
// (@supabase/supabase-js) al bundle inicial: los componentes que solo
// necesitan estos valores ya no obligan a descargar el SDK.
//
// VITE_SUPABASE_* se inyectan en build (Cloudflare). Los valores incrustados
// son el respaldo; la clave anonima es publica por diseno (la seguridad la
// aplican las politicas RLS de Supabase).
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ||
  'https://xvhyclucrnxplsanspaj.supabase.co') as string;

export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aHljbHVjcm54cGxzYW5zcGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MTMyODQsImV4cCI6MjEwODQ4OTI4NH0.QFHdgQNNk8L-fSQ__cbKHK807QHXbGDhjk5Cxfs8csM') as string;
