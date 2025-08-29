// hooks/useDonations.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

export type Donation = {
  id: string;
  reference: string;
  status: string;
  amount_in_cents: number | null;
  updated_at: string | null;
  created_at: string;
  customer_name?: string | null;
  customer_email?: string | null;
  payment_method?: string | null;
  bank?: string | null;
  cus?: string | null;
  description?: string | null;
};

const NF = new Intl.NumberFormat("es-CO");

export function useDonations(limit = 50) {
  const [rows, setRows] = useState<Donation[]>([]);
  const lastFetch = useRef<number>(0);

  async function fetchLatest() {
    lastFetch.current = Date.now();
    const { data } = await supabase
      .from("donations")
      .select(
        "id,reference,status,amount_in_cents,updated_at,created_at,customer_name,customer_email,payment_method,bank,cus,description"
      )
      .order("updated_at", { ascending: false })
      .limit(limit);
    setRows(data ?? []);
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
            const i = prev.findIndex((r) => r.id === rec.id);
            const next = i >= 0 ? [...prev] : [rec, ...prev];
            if (i >= 0) next[i] = rec;
            next.sort(
              (a, b) =>
                new Date(b.updated_at ?? b.created_at).getTime() -
                new Date(a.updated_at ?? a.created_at).getTime()
            );
            return next.slice(0, limit);
          });
        }
      )
      .subscribe();

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
        amountFormatted: `$${NF.format((r.amount_in_cents ?? 0) / 100)}`,
      })),
    [rows]
  );
}
