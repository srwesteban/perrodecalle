import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type Donation = {
  id: string;
  reference: string;
  amount_in_cents: number;
  currency: string;
  status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
  created_at: string;
  tx_id: string | null;
};

export function useDonations(limit = 50) {
  const [rows, setRows] = useState<Donation[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (!error && data) setRows(data as Donation[]);
    })();

    const ch = supabase
      .channel("donations")
      .on("postgres_changes", { event: "*", schema: "public", table: "donations" }, (payload) => {
        setRows((prev) => {
          const next = [...prev];
          const row = payload.new as Donation;
          const i = next.findIndex((r) => r.id === row.id);
          if (i >= 0) next[i] = row;
          else next.unshift(row);
          return next.slice(0, limit);
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [limit]);

  return rows;
}
