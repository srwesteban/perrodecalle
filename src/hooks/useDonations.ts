import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Usa las mismas envs que ya tienes en el proyecto
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

type Donation = {
  id: string;
  reference: string;
  status: "APPROVED" | "DECLINED" | "VOIDED" | "PENDING" | string;
  amount_in_cents: number;
  updated_at: string | null;
  created_at: string;
};

export function useDonations(limit = 50) {
  const [rows, setRows] = useState<Donation[]>([]);

  useEffect(() => {
    let mounted = true;

    // carga inicial
    supabase
      .from("donations")
      .select("id,reference,status,amount_in_cents,updated_at,created_at")
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(limit)
      .then(({ data, error }) => {
        if (mounted && !error) setRows(data ?? []);
      });

    // suscripción realtime (INSERT/UPDATE/DELETE)
    const channel = supabase
      .channel("donations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        (payload) => {
          const rec: Donation =
            (payload.new as Donation) ??
            (payload.old as Donation);

          setRows((prev) => {
            if (payload.eventType === "DELETE") {
              return prev.filter((r) => r.id !== rec.id).slice(0, limit);
            }

            // upsert por id o referencia
            const i = prev.findIndex(
              (r) => r.id === rec.id || r.reference === rec.reference
            );
            const next = i >= 0 ? [...prev] : [rec, ...prev];
            if (i >= 0) next[i] = rec;

            next.sort((a, b) => {
              const ta = new Date(a.updated_at ?? a.created_at).getTime();
              const tb = new Date(b.updated_at ?? b.created_at).getTime();
              return tb - ta;
            });

            return next.slice(0, limit);
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [limit]);

  // pequeña optimización de formateo
  const formatted = useMemo(() => {
    const nf = new Intl.NumberFormat("es-CO");
    return rows.map((r) => ({
      ...r,
      amountFormatted: `$${nf.format((r.amount_in_cents ?? 0) / 100)}`,
    }));
  }, [rows]);

  return formatted;
}
