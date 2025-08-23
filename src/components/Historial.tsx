import { memo } from "react";
import { useDonations } from "../hooks/useDonations";

function HistorialBase() {
  const rows = useDonations(50);

  return (
    <div className="flex flex-col gap-2 bg-black">
      <p className="font-bold">📜 Historial de Donaciones</p>
      <ul className="space-y-1 text-sm text-gray-300 max-h-80 overflow-auto pr-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3">
            <span className="truncate">{r.reference}</span>
            <span
              className={
                r.status === "APPROVED"
                  ? "text-emerald-400"
                  : r.status === "DECLINED"
                  ? "text-rose-400"
                  : r.status === "VOIDED"
                  ? "text-yellow-400"
                  : "text-amber-300"
              }
            >
              {r.status}
            </span>
            <span>{r.amountFormatted}</span>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="text-gray-400">Sin donaciones aún</li>
        )}
      </ul>
    </div>
  );
}

export default memo(HistorialBase);
