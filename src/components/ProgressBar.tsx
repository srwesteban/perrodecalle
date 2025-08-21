// src/components/ProgressBar.tsx
import { useMemo } from "react";
import { useDonations } from "../hooks/useDonations";

export default function ProgressBar({ goal = 1000000 }: { goal?: number }) {
  const rows = useDonations();
  const total = useMemo(
    () => rows.filter(r => r.status === "APPROVED").reduce((s, r) => s + (r.amount_in_cents ?? 0), 0),
    [rows]
  );
  const pct = Math.min(100, Math.round((total / goal) * 100));

  return (
    <div className="p-4 rounded-xl border border-red-500">
      <div className="flex justify-between text-sm mb-1">
        <span>Meta: ${ (goal/100).toLocaleString("es-CO") }</span>
        <span>Recaudado: ${ (total/100).toLocaleString("es-CO") } ({pct}%)</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
