import { createClient } from "@supabase/supabase-js";

const env = (import.meta as any).env || {};
const rawUrl = env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";

// Sanitize URL to avoid HTTP 404 errors when /rest/v1 is appended to the VITE_SUPABASE_URL in environment configuration
const sanitizeSupabaseUrl = (url: string): string => {
  if (!url) return "";
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, "");
  cleaned = cleaned.replace(/\/auth\/v1\/?$/, "");
  cleaned = cleaned.replace(/\/+$/, "");
  return cleaned;
};

const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || "placeholder-key").trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = (): boolean => {
  const env = (import.meta as any).env || {};
  return (
    !!env.VITE_SUPABASE_URL &&
    !!env.VITE_SUPABASE_ANON_KEY &&
    env.VITE_SUPABASE_URL !== "https://placeholder-project.supabase.co"
  );
};
