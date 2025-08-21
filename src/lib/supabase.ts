// src/lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

declare global {
  // Para que Vite HMR no cree múltiples instancias
  // eslint-disable-next-line no-var
  var __supabase: SupabaseClient | undefined;
}

const url = import.meta.env.VITE_SUPABASE_URL!;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase =
  globalThis.__supabase ??
  (globalThis.__supabase = createClient(url, anon, {
    auth: {
      // Puedes cambiar a true si necesitas sesión persistente; el warning no depende de esto.
      persistSession: false,
      storageKey: "supabase-auth", // clave única de storage
    },
  }));
