import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type Donation = {
  id: string;
  reference: string;
  amount_in_cents: number;
  amount_cop: number; // columna generada en COP
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

    // Realtime SIN filtro: filtramos en el callback
    const ch = supabase
      .channel("donations-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "donations" },
        (payload: any) => {
          const row = payload.new as Donation;
          if (row.status !== "APPROVED") return; // solo aprobadas

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
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "donations" },
        (payload: any) => {
          const row = payload.new as Donation;
          if (row.status !== "APPROVED") return;

          setRows((prev) => {
            const idx = prev.findIndex((r) => r.id === row.id);
            const normalized = {
              ...row,
              amount_in_cents: Number((row as any).amount_in_cents),
              amount_cop: Number((row as any).amount_cop),
            };
            if (idx === -1) return [normalized, ...prev].slice(0, limit);
            const copy = prev.slice();
            copy[idx] = normalized;
            return copy;
          });
        }
      )
      .subscribe((status) => {
        // Descomenta para depurar suscripción
        // console.log("Realtime status:", status);
      });

    // Fallback: escuchar un evento del navegador para forzar reload puntual
    const forceReload = () => load();
    window.addEventListener("donation:inserted", forceReload);

    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
      window.removeEventListener("donation:inserted", forceReload);
    };
  }, [limit]);

  return rows;
}
