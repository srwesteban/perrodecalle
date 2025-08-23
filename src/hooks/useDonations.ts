import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

export type Donation = {
  id: string;
  reference: string;
  status: "APPROVED" | "DECLINED" | "VOIDED" | "PENDING" | string;
  amount_in_cents: number | null;
  updated_at: string | null;
  created_at: string;
};

const NF = new Intl.NumberFormat("es-CO");

export function useDonations(limit = 50) {
  const [rows, setRows] = useState<Donation[]>([]);
  const lastFetch = useRef<number>(0);

  async function fetchLatest() {
    lastFetch.current = Date.now();
    const { data } = await supabase
      .from("donations")
      .select("id,reference,status,amount_in_cents,updated_at,created_at")
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(limit);
    setRows((data ?? []).slice(0, limit));
  }

  useEffect(() => {
    let alive = true;

    // 1) carga inicial
    fetchLatest();

    // 2) realtime
    const ch = supabase
      .channel("donations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        (payload) => {
          const rec = (payload.new ?? payload.old) as Donation;

          setRows((prev) => {
            if (payload.eventType === "DELETE") {
              return prev.filter((r) => r.id !== rec.id);
            }
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
      .subscribe((status) => {
        // si por alguna razón falla la suscripción, hacemos fetch
        if (status === "SUBSCRIBED") return;
        fetchLatest();
      });

    // 3) fallback de *polling* cada 3s si no hubo eventos
    const poll = setInterval(() => {
      if (Date.now() - lastFetch.current > 3000) fetchLatest();
    }, 3000);

    return () => {
      alive = false;
      clearInterval(poll);
      supabase.removeChannel(ch);
    };
  }, [limit]);

  return useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        amountFormatted: `$${NF.format((r.amount_in_cents ?? 0) / 100)}`,
      })),
    [rows]
  );
}
