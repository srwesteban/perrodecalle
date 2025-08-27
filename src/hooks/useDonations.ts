// hooks/useDonations.ts (resumen)
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type Donation = {
  id: string;
  provider: string | null;
  transaction_id: string | null;
  reference: string;
  status: string;                 // APPROVED | DECLINED | ...
  amount_in_cents: number | null;
  currency: string | null;
  updated_at: string | null;
  created_at: string;
  amountFormatted?: string;
};

const NF = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export function useDonations(limit = 50) {
  const [rows, setRows] = useState<Donation[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("id,provider,transaction_id,reference,status,amount_in_cents,currency,updated_at,created_at")
        .order("updated_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error(error);
        setRows([]);
        return;
      }

      setRows(
        (data ?? []).map((d) => ({
          ...d,
          amountFormatted:
            d.amount_in_cents != null
              ? NF.format(Math.round(d.amount_in_cents / 100))
              : "—",
        }))
      );
    })();
  }, [limit]);

  return rows;
}
