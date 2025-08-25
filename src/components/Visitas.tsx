// src/components/Visitas.tsx
import { useEffect, useState } from "react";

export default function Visitas() {
  const [n, setN] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // quita el ?debug=1, usamos el endpoint normal
        const r = await fetch("/api/ga/total-views", { cache: "no-store" });
        const j = await r.json();
        setN(Number(j.totalViews ?? 0));
      } catch (e: any) {
        setErr(e.message || "Error");
      }
    })();
  }, []);

  if (err) return <span style={{ color: "#f43" }}>Error: {err}</span>;
  if (n === null) return <span>Visitas: …</span>;
  return <span>Visitas: {n.toLocaleString()}</span>;
}
