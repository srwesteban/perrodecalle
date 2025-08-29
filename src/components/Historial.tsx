import { memo } from "react";
import useDonationHistory from "../../hooks/useDonationHistory";

function Badge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    Aprobada: "bg-green-100 text-green-800",
    Rechazada: "bg-red-100 text-red-800",
    Pendiente: "bg-yellow-100 text-yellow-800",
    Anulada: "bg-gray-100 text-gray-800",
    Error: "bg-orange-100 text-orange-800",
  };
  const cls = map[estado] ?? "bg-slate-100 text-slate-800";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {estado}
    </span>
  );
}

function HistorialBase() {
  const rows = useDonationHistory(50);

  return (
    <div className="w-full">
      <h3 className="text-white/90 font-semibold mb-2">Historial</h3>

      <ul className="divide-y divide-white/10 rounded-lg bg-white/5 backdrop-blur">
        {rows.map((r) => (
          <li key={r.id} className="px-3 py-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              {/* Nombre */}
              <p className="text-sm font-semibold text-white truncate">
                {r.nombre}
              </p>
              {/* Fecha */}
              <p className="text-xs text-white/60">{r.fechaLabel}</p>
            </div>

            {/* Estado */}
            <div className="flex-shrink-0">
              <Badge estado={r.estadoLabel} />
            </div>

            {/* Monto */}
            <div className="flex-shrink-0 text-right">
              <p className="text-sm font-semibold text-white">{r.montoLabel}</p>
              <p className="text-[11px] text-white/50">{r.currency || "COP"}</p>
            </div>
          </li>
        ))}

        {rows.length === 0 && (
          <li className="text-gray-300 text-center py-3">Sin donaciones aún</li>
        )}
      </ul>
    </div>
  );
}

export default memo(HistorialBase);
