import { createClient } from "@supabase/supabase-js";

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = (): boolean => {
  const env = (import.meta as any).env || {};
  return (
    !!env.VITE_SUPABASE_URL &&
    !!env.VITE_SUPABASE_ANON_KEY &&
    env.VITE_SUPABASE_URL !== "https://placeholder-project.supabase.co"
  );
};
