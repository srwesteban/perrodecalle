// hooks/useDonationHistory.ts
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../src/lib/supabase";

export type DonationHistoryRow = {
  id: string;
  reference: string;
  status: string;
  amount_in_cents: number | null;
  currency: string | null;
  customer_name: string | null;
  event_time: string | null; // ISO string
};

const NF = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
const DF = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Bogota",
});

function estadoES(s: string) {
  switch (s) {
    case "APPROVED": return "Aprobada";
    case "DECLINED": return "Rechazada";
    case "PENDING":  return "Pendiente";
    case "VOIDED":   return "Anulada";
    case "ERROR":    return "Error";
    default:         return s;
  }
}

export default function useDonationHistory(limit = 50) {
  const [rows, setRows] = useState<DonationHistoryRow[]>([]);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      const { data, error } = await supabase
        .from("v_history")
        .select("*")
        .order("event_time", { ascending: false })
        .limit(limit);

      if (!mounted) return;
      if (error) {
        console.error("[useDonationHistory] error", error);
        setRows([]);
        return;
      }
      setRows(data ?? []);
    }

    fetchData();

    // Realtime: escuchar cambios en donation_events y volver a leer la vista
    const ch = supabase
      .channel("donation_events-history")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "donation_events",
        },
        () => fetchData()
      )
      .subscribe();

    // Poll de respaldo por si el realtime falla
    const poll = setInterval(fetchData, 10_000);

    return () => {
      mounted = false;
      clearInterval(poll);
      supabase.removeChannel(ch);
    };
  }, [limit]);

  return useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        nombre: r.customer_name?.trim() || "Anónimo",
        estadoLabel: estadoES(r.status ?? ""),
        montoLabel: `$${NF.format(Math.max(0, (r.amount_in_cents ?? 0) / 100))}`,
        fechaLabel: r.event_time ? DF.format(new Date(r.event_time)) : "",
      })),
    [rows]
  );
}
