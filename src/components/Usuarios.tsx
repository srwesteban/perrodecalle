import { useEffect, useState } from "react";

export default function Usuarios() {
  const [n, setN] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/ga/total-users", { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j: { totalUsers?: number } = await r.json();
        if (!cancelled) setN(Number(j.totalUsers ?? 0));
      } catch (e: any) {
        if (!cancelled) setErr(e.message || "Error");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (err) return <span style={{ color: "#f43" }}>Error: {err}</span>;
  return <span>Usuarios: {n === null ? "…" : n.toLocaleString()}</span>;
}
