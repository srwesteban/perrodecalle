import { useEffect, useRef, useState } from "react";
import { supabase } from "../src/lib/supabase";

const PULSE_MS = 5200;

export function useCelebrateDonations() {
  const [active, setActive] = useState(false);
  const seen = useRef<Set<string>>(new Set());

  const trigger = (key: string) => {
    if (seen.current.has(key)) return;
    seen.current.add(key);
    setActive(true);
    setTimeout(() => setActive(false), PULSE_MS);
  };

  useEffect(() => {
    const ch = supabase
      .channel("confetti-realtime")

      // 1) INSERT en donations => si llega ya APPROVED
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "donations" },
        (payload: any) => {
          const row = payload.new;
          if (row?.status === "APPROVED") {
            const key = row.id || row.reference;
            trigger(String(key));
          }
        }
      )

      // 2) UPDATE en donations => transición a APPROVED
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "donations" },
        (payload: any) => {
          const row = payload.new;
          const prev = payload.old;
          if (row?.status === "APPROVED" && prev?.status !== "APPROVED") {
            const key = row.id || row.reference;
            trigger(String(key));
          }
        }
      )

      // 3) INSERT en donation_events => evento APROBADO
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "donation_events" },
        (payload: any) => {
          const ev = payload.new;
          if (ev?.status === "APPROVED") {
            // Usamos tx_id, si no reference, si no id
            const key = ev.tx_id || ev.reference || ev.id;
            trigger(String(key));
          }
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  return active;
}
