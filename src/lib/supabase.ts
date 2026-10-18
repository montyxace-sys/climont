import { createClient } from '@supabase/supabase-js';

// VITE_SUPABASE_* se inyectan en build (Cloudflare/Netlify). Como respaldo
// van incrustados los valores por defecto: la clave anónima es pública por
// diseño (la seguridad la aplican las políticas RLS de Supabase).
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ||
  'https://thrwdrwsdtqxbgooshvr.supabase.co') as string;
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocndkcndzZHRxeGJnb29zaHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTU1NDksImV4cCI6MjEwNjUzMTU0OX0.TcylsS9f_kQJoG6rbT_sSvpQNiuLsC0t0Q1V8IKJabA') as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
