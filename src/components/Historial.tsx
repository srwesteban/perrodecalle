import { memo } from "react";
import { useDonations } from "../hooks/useDonations";

function HistorialBase() {
  const rows = useDonations(50);

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-xl p-3">
      {/* Título fijo arriba */}
      <p className="font-bold mb-2">📜 Historial de Donaciones</p>

      {/* Lista que se expande y hace scroll */}
      <ul className="flex-1 overflow-auto space-y-1 text-sm text-gray-300 pr-2">
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
