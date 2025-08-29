// hooks/useDonations.ts
import { useEffect, useMemo, useRef, useState } from "react";
// ⬇️ Ajusta esta ruta si tu cliente está en otro lugar
import { supabase } from "../../src/lib/supabase";

// Estados válidos en tu enum SQL
export type DonationStatus = "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";

export type Donation = {
  id: string;
  reference: string;
  status: DonationStatus;
  amount_in_cents: number | null;
  currency: string;
  provider: string;
  tx_id: string | null;
  created_at: string;           // ISO
  updated_at: string | null;    // ISO | null
  // Campos **derivados en el cliente** (no existen en DB):
  event_time?: string;          // = updated_at ?? created_at (para ordenar/mostrar)
  amountFormatted?: string;     // "$x.xxx"
  customer_name?: string;       // "Anónimo" (compat con Historial)
};

export type DonationStats = {
  totalCount: number;
  approvedCount: number;
  pendingCount: number;
  declinedCount: number;
  approvedCents: number;
  approvedCOP: string;
};

const NF = new Intl.NumberFormat("es-CO");

/**
 * Orden estable por fecha "mejor esfuerzo" sin depender de columnas inexistentes.
 * event_time = updated_at ?? created_at
 */
function withDerived(r: Omit<Donation, "event_time" | "amountFormatted" | "customer_name">): Donation {
  const event_time = (r.updated_at ?? r.created_at) as string;
  const amountFormatted = `$${NF.format(((r.amount_in_cents ?? 0) / 100))}`;
  // Compat con componentes que esperan "customer_name"
  const customer_name = "Anónimo";
  return { ...r, event_time, amountFormatted, customer_name };
}

function sortByEventTimeDesc(a: Donation, b: Donation) {
  const ta = new Date(a.event_time ?? a.updated_at ?? a.created_at).getTime();
  const tb = new Date(b.event_time ?? b.updated_at ?? b.created_at).getTime();
  return tb - ta;
}

function computeStats(rows: Donation[]): DonationStats {
  let approvedCount = 0, pendingCount = 0, declinedCount = 0, approvedCents = 0;

  for (const r of rows) {
    if (r.status === "APPROVED") {
      approvedCount++;
      approvedCents += r.amount_in_cents ?? 0;
    } else if (r.status === "PENDING") {
      pendingCount++;
    } else if (r.status === "DECLINED") {
      declinedCount++;
    }
  }
  return {
    totalCount: rows.length,
    approvedCount,
    pendingCount,
    declinedCount,
    approvedCents,
    approvedCOP: `$${NF.format(approvedCents / 100)}`
  };
}

/**
 * Hook principal: trae donaciones recientes desde **public.donations**
 * - Sin pedir columnas inexistentes → evita el 400 Bad Request
 * - Enriquecido con amountFormatted / event_time / customer_name (Anónimo)
 * - Realtime + polling suave para robustez
 */
export function useDonations(limit = 50) {
  const [rows, setRows] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetch = useRef<number>(0);

  async function fetchLatest() {
    try {
      lastFetch.current = Date.now();
      setError(null);
      // 🔹 SOLO columnas que EXISTEN en tu tabla actual
      const { data, error: err } = await supabase
        .from("donations")
        .select("id,reference,status,amount_in_cents,currency,provider,tx_id,created_at,updated_at")
        .order("updated_at", { ascending: false }) // orden preliminar, luego reordenamos por event_time
        .limit(limit);

      if (err) throw err;

      const mapped = (data ?? []).map(withDerived).sort(sortByEventTimeDesc).slice(0, limit);
      setRows(mapped);
    } catch (e: any) {
      console.error("[useDonations] fetchLatest error:", e);
      setError(e?.message ?? "Error al cargar donaciones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLatest();

    // Realtime por cambios en la tabla
    const ch = supabase
      .channel("donations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        (payload) => {
          const rec = (payload.new ?? payload.old) as Donation;
          const enriched = withDerived(rec);
          setRows((prev) => {
            const i = prev.findIndex((r) => r.id === enriched.id);
            const next = i >= 0 ? [...prev] : [enriched, ...prev];
            if (i >= 0) next[i] = enriched;
            next.sort(sortByEventTimeDesc);
            return next.slice(0, limit);
          });
        }
      )
      .subscribe();

    // Polling “rescate” por si se pierde algún evento
    const poll = setInterval(() => {
      if (Date.now() - lastFetch.current > 5000) fetchLatest();
    }, 5000);

    return () => {
      clearInterval(poll);
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const stats = useMemo(() => computeStats(rows), [rows]);

  return {
    rows,          // Para Historial (ya trae customer_name="Anónimo", amountFormatted, event_time)
    stats,         // Para ProgressBar si quieres usar totales/approved directamente
    loading,
    error,
    refetch: fetchLatest,
  };
}

/**
 * Hook para progreso hacia una meta (ProgressBar):
 * - Calcula % con base en montos APPROVED de las filas cargadas por useDonations
 * - Si quieres sumar TODO el histórico, sube el `limit` al usar useDonations en el componente
 */
export function useGoalProgress(goalInCents: number, limitForSum = 200) {
  // Reutiliza useDonations para no duplicar suscripción/polling
  const { rows, stats, loading, error, refetch } = useDonations(limitForSum);

  const percent = useMemo(() => {
    const goal = Math.max(1, Math.floor(goalInCents)); // evita div/0
    const p = (stats.approvedCents / goal) * 100;
    // clamp 0..100 sin redondeo brusco
    return Number.isFinite(p) ? Math.max(0, Math.min(100, p)) : 0;
  }, [stats.approvedCents, goalInCents]);

  return {
    percent,               // número 0..100 (puedes formatearlo como quieras)
    approvedCOP: stats.approvedCOP,
    approvedCents: stats.approvedCents,
    totalCount: stats.totalCount,
    rows,                  // por si quieres mostrar últimos aprobados debajo de la barra
    loading,
    error,
    refetch,
  };
}
