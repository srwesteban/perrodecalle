// src/components/GaPageViews.tsx
import { useEffect, useMemo, useState } from "react";
type Row = { title: string; path: string; views: number; users: number };

export default function GaPageViews() {
  const [range, setRange] = useState<"7"|"14"|"28"|"90"|"all">("all");
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const qs = range === "all" ? "range=all" : `days=${range}`;
        const r = await fetch(`/api/ga/pageviews?${qs}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        if (!cancelled) setData(j.rows || []);
      } catch (e: any) {
        if (!cancelled) setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [range]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return q ? data.filter(d =>
      d.title.toLowerCase().includes(q) || d.path.toLowerCase().includes(q)
    ) : data;
  }, [data, query]);

  const totals = useMemo(() => ({
    views: filtered.reduce((s, r) => s + r.views, 0),
    users: filtered.reduce((s, r) => s + r.users, 0),
  }), [filtered]);

  return (
    <div className="p-4 rounded-2xl border shadow-sm">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">Vistas por página</h3>
          <p className="text-sm opacity-70">
            {range === "all" ? "Todo el tiempo" : `Últimos ${range} días`} ·
            {" "}Total vistas: <b>{totals.views.toLocaleString()}</b> ·
            {" "}Usuarios: <b>{totals.users.toLocaleString()}</b>
          </p>
        </div>
        <div className="flex gap-2">
          <input
            className="border rounded-lg px-3 py-2 text-sm w-56"
            placeholder="Filtrar por título o ruta…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
          >
            <option value="all">Todo el tiempo</option>
            <option value="7">7 días</option>
            <option value="14">14 días</option>
            <option value="28">28 días</option>
            <option value="90">90 días</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Título</th>
              <th className="py-2 pr-3">Ruta</th>
              <th className="py-2 pr-3">Vistas</th>
              <th className="py-2">Usuarios</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-6">Cargando…</td></tr>
            ) : err ? (
              <tr><td colSpan={4} className="py-6 text-red-600">Error: {err}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="py-6 opacity-70">Sin datos.</td></tr>
            ) : (
              filtered.map(r => (
                <tr key={r.path} className="border-b last:border-0">
                  <td className="py-2 pr-3">{r.title}</td>
                  <td className="py-2 pr-3">{r.path}</td>
                  <td className="py-2 pr-3">{r.views.toLocaleString()}</td>
                  <td className="py-2">{r.users.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
