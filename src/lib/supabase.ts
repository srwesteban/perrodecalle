import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!url || !anon) {
  console.error("Faltan variables:", { hasUrl: !!url, hasAnon: !!anon });
  throw new Error("VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están definidas");
}

export const supabase = createClient(url, anon);
