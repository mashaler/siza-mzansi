import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Loud in dev, so a missing .env file fails fast instead of silently
  // returning empty data everywhere.
  console.warn(
    "[Siza Mzansi] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. " +
    "Copy .env.example to .env and fill in your Supabase project credentials."
  );
}

export const supabase = createClient(url, anonKey);
