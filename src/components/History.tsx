// src/components/History.tsx
import { useDonations } from "../hooks/useDonations";

export default function History() {
  const rows = useDonations();
  return (
    <div className="p-4 rounded-xl border border-red-500">
      <h3 className="font-semibold mb-3">Historial</h3>
      <ul className="space-y-2 max-h-80 overflow-auto">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between text-sm">
            <span className="truncate">{r.reference}</span>
            <span className={r.status === "APPROVED" ? "text-emerald-600" : r.status === "DECLINED" ? "text-rose-600" : "text-amber-600"}>
              {r.status}
            </span>
            <span>${(r.amount_in_cents / 100).toLocaleString("es-CO")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
