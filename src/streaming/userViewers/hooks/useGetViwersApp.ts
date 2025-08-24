import { useEffect, useState, useMemo } from "react";
import { countViewers, getOrCreateViewerId, registerViewer } from "../utils/getViewerUser";

export function useGetViewersApp() {
  const [totalViewers, setTotalViewers] = useState(0);
  const viewerId = useMemo(getOrCreateViewerId, []);

  useEffect(() => {
    Promise.all([registerViewer(viewerId), countViewers()])
      .then(([{ error: insertError }, { count, error: countError }]) => {
        if (insertError) console.error("❌ Error al registrar viewer:", insertError.message);
        if (countError) console.error("❌ Error al contar viewers:", countError.message);
        else setTotalViewers(count ?? 0);
      })
      .catch(err => console.error("❌ Error inesperado:", err));
  }, [viewerId]);

  return totalViewers;
}
