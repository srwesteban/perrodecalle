// hooks/useDonationEvents.ts
import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabase";

export type DonationEvent = {
  id: string;
  reference: string;
  tx_id: string | null;
  status: string;
  amount_in_cents: number | null;
  currency: string;
  provider: string;
  created_at: string;
};

export function useDonationEvents(reference: string) {
  const [events, setEvents] = useState<DonationEvent[]>([]);

  async function fetchEvents() {
    const { data } = await supabase
      .from("donation_events")
      .select("*")
      .eq("reference", reference)
      .order("created_at", { ascending: true });
    setEvents(data ?? []);
  }

  useEffect(() => {
    fetchEvents();
    const ch = supabase
      .channel("donation_events-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donation_events" },
        (payload) => {
          const rec = (payload.new ?? payload.old) as DonationEvent;
          if (rec.reference === reference) {
            setEvents((prev) =>
              [...prev, rec].sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [reference]);

  return events;
}
