// Configuracion publica de Supabase, sin dependencias.
// Permite importar la URL y la clave anonima sin arrastrar el SDK
// (@supabase/supabase-js) al bundle inicial: los componentes que solo
// necesitan estos valores ya no obligan a descargar el SDK.
//
// VITE_SUPABASE_* se inyectan en build (Cloudflare). Los valores incrustados
// son el respaldo; la clave anonima es publica por diseno (la seguridad la
// aplican las politicas RLS de Supabase).
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ||
  'https://thrwdrwsdtqxbgooshvr.supabase.co') as string;

export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocndkcndzZHRxeGJnb29zaHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTU1NDksImV4cCI6MjEwNjUzMTU0OX0.TcylsS9f_kQJoG6rbT_sSvpQNiuLsC0t0Q1V8IKJabA') as string;
