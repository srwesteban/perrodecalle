import { useMemo } from "react";
import { useDonations } from "../hooks/useDonations";

export default function ProgressBar({ goal }: { goal: number }) {
  const rows = useDonations();

  const { totalCOP, pct } = useMemo(() => {
    const total = rows
      .filter((d) => d.status === "APPROVED")
      .reduce((acc, d) => acc + ((d.amount_in_cents ?? 0) / 100), 0);
    return { totalCOP: total, pct: Math.min(100, Math.floor((total / goal) * 100)) };
  }, [rows, goal]);

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span>Meta: ${goal.toLocaleString("es-CO")} COP</span>
        <span>Recaudado: ${Math.floor(totalCOP).toLocaleString("es-CO")} COP</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div className="bg-green-500 h-3" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-right text-xs text-gray-300">{pct}%</div>
    </div>
  );
}
