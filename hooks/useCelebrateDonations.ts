// hooks/useCelebrateDonations.ts
import { useEffect } from "react";
import { supabase } from "../src/lib/supabase";

export function useCelebrateDonations(onApproved: (donation: any) => void) {
  useEffect(() => {
    const ch = supabase
      .channel("donations-approved-only")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "donations" },
        (payload) => {
          const rec = payload.new as any;
          if (rec?.status === "APPROVED") {
            // Solo aquí ejecutas el callback
            onApproved(rec);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [onApproved]);
}
