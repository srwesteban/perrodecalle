import { useDonations } from "../hooks/useDonations";

export default function ProgressBar({ goal }: { goal: number }) {
  const donations = useDonations();

  // Total aprobado en COP (ya viene en pesos)
  const totalCOP = donations
    .filter((d) => d.status === "APPROVED")
    .reduce((acc, d) => acc + d.amount_cop, 0);

  const pct = Math.min(100, Math.floor((totalCOP / goal) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span>Meta: ${goal.toLocaleString("es-CO")} COP</span>
        <span>Recaudado: ${Math.floor(totalCOP).toLocaleString("es-CO")} COP</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-green-500 h-3"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-right text-xs text-gray-300">{pct}%</div>
    </div>
  );
}
