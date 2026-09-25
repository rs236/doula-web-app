import { createClient } from "@supabase/supabase-js";

const supabaseUrl = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_URL : undefined);
const supabaseAnonKey = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_ANON_KEY : undefined);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("http") &&
  supabaseAnonKey.length > 20
);

if (!isSupabaseConfigured) {
  console.info(
    "[Supabase] Not fully configured. Running with local fallback. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or Vercel settings to connect your live Supabase project."
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
