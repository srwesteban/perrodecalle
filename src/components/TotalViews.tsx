// src/components/TotalViews.tsx
import { useEffect, useState } from "react";

export default function TotalViews() {
  const [n, setN] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/ga/total-views", { cache: "no-store" });
        const j = await r.json();
        setN(j.totalViews ?? 0);
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, []);

  if (err) return <div style={{ color: "#f43" }}>Error: {err}</div>;
  if (n === null) return <div>Visitas: …</div>;
  return <div>Visitas: {n.toLocaleString()}</div>;
}
