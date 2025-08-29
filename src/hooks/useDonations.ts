import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { formatCOP, safeTimeMs } from "../utils/format";

export type Donation = {
  id: string;
  reference: string;
  status: "APPROVED" | "DECLINED" | "VOIDED" | "PENDING" | string;
  amount_in_cents: number | null;
  updated_at: string | null;
  created_at: string;
};

export type DonationView = Donation & { amountFormatted: string };

export function useDonations(limit = 50): DonationView[] {
  const [rows, setRows] = useState<Donation[]>([]);
  const lastFetch = useRef<number>(0);

  async function fetchLatest() {
    try {
      lastFetch.current = Date.now();
      const { data, error } = await supabase
        .from("donations")
        .select("id,reference,status,amount_in_cents,updated_at,created_at")
        .order("updated_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("supabase fetch error:", error);
        return;
      }
      setRows((data ?? []).slice(0, limit));
    } catch (e) {
      console.error("fetchLatest error:", e);
    }
  }

  useEffect(() => {
    fetchLatest();

    const ch = supabase
      .channel("donations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        (payload) => {
          const rec = (payload.new ?? payload.old) as Donation;

          setRows((prev) => {
            if (payload.eventType === "DELETE") {
              return prev.filter((r) => r.id !== rec.id).slice(0, limit);
            }

            // UPSERT por id o reference
            const i = prev.findIndex(
              (r) => r.id === rec.id || r.reference === rec.reference
            );
            const next = i >= 0 ? [...prev] : [rec, ...prev];
            if (i >= 0) next[i] = rec;

            // Orden robusto por tiempo
            next.sort((a, b) => {
              const ta = safeTimeMs(a.updated_at ?? a.created_at);
              const tb = safeTimeMs(b.updated_at ?? b.created_at);
              return tb - ta;
            });

            return next.slice(0, limit);
          });
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") fetchLatest();
      });

    // Poll de respaldo cada 3s
    const poll = setInterval(() => {
      if (Date.now() - lastFetch.current > 3000) fetchLatest();
    }, 3000);

    return () => {
      clearInterval(poll);
      supabase.removeChannel(ch);
    };
  }, [limit]);

  return useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        amountFormatted: `$${formatCOP((r.amount_in_cents ?? 0) / 100)}`,
      })),
    [rows]
  );
}
