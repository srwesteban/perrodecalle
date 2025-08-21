import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type Donation = {
  id: string;
  reference: string;
  amount_in_cents: number;
  amount_cop: number; // ya en COP desde la BD (columna generada)
  currency: string;
  status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
  created_at: string;
  tx_id: string | null;
};

export function useDonations(limit = 50) {
  const [rows, setRows] = useState<Donation[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("donations")
        .select(
          "id, reference, amount_in_cents, amount_cop, currency, status, created_at, tx_id"
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (cancelled) return;

      if (error) {
        console.error("Supabase SELECT error:", error);
        setRows([]);
      } else {
        setRows(
          (data ?? []).map((d: any) => ({
            ...d,
            amount_in_cents: Number(d.amount_in_cents),
            amount_cop: Number(d.amount_cop),
          }))
        );
      }
    }

    load();

    const ch = supabase
      .channel("donations-realtime")
      // Solo INSERTS que ya llegan como APPROVED
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "donations",
          filter: "status=eq.APPROVED",
        },
        (payload: any) => {
          const row = payload.new as Donation;
          setRows((prev) => [
            {
              ...row,
              amount_in_cents: Number((row as any).amount_in_cents),
              amount_cop: Number((row as any).amount_cop),
            },
            ...prev,
          ].slice(0, limit));
        }
      )
      // Y UPDATES que terminan en APPROVED (ej: PENDING -> APPROVED)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "donations",
          filter: "status=eq.APPROVED",
        },
        (payload: any) => {
          const row = payload.new as Donation;
          setRows((prev) =>
            prev.map((r) =>
              r.id === row.id
                ? {
                    ...row,
                    amount_in_cents: Number((row as any).amount_in_cents),
                    amount_cop: Number((row as any).amount_cop),
                  }
                : r
            )
          );
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [limit]);

  return rows;
}
