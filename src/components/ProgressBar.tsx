import { useMemo } from "react";
import { useDonations } from "../hooks/useDonations";

export default function ProgressBar({ goal }: { goal: number }) {
  // goal en COP (p. ej. 1_000_000)
  const donations = useDonations(); // trae amount_in_cents

  const { totalCOP, pct } = useMemo(() => {
    const total = donations
      .filter((d) => d.status === "APPROVED")
      .reduce((acc, d) => acc + ((d.amount_in_cents ?? 0) / 100), 0); // a COP

    const percent = Math.min(100, Math.floor((total / goal) * 100));
    return { totalCOP: total, pct: percent };
  }, [donations, goal]);

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
