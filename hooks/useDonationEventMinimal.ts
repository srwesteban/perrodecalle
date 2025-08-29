import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabase";

export type DonationEventMin = {
  id: string;
  reference: string;
  name: string | null;
  status: string;
  amount_in_cents: number | null;
  currency: string;
  event_time: string | null;
};

export default function useDonationEventMinimal(reference: string) {
  const [rows, setRows] = useState<DonationEventMin[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("v_donation_event_min")
        .select("*")
        .eq("reference", reference)
        .order("event_time", { ascending: true, nullsFirst: false });

      if (!mounted) return;
      if (error) {
        console.error(error);
        setRows([]);
      } else {
        setRows(data ?? []);
      }
    };

    fetchData();

    const ch = supabase
      .channel("donation_events-min")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donation_events" },
        (payload) => {
          const rec = payload.new as { reference?: string } | null;
          if (!rec || rec.reference !== reference) return;
          fetchData();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, [reference]);

  return rows;
}
