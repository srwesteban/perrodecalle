import { memo } from "react";
import useDonationHistory from "../../hooks/useDonationHistory"; // 👈 el hook que te preparé

function traducirEstado(estado: string) {
  switch (estado) {
    case "APPROVED": return "Aprobada";
    case "DECLINED": return "Rechazada";
    case "PENDING":  return "Pendiente";
    case "VOIDED":   return "Anulada";
    case "ERROR":    return "Error";
    default: return estado;
  }
}

function HistorialBase() {
  // ✅ ahora lee de la vista/history (último evento por referencia)
  const rows = useDonationHistory(50);

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-xl p-3">
      <p className="font-bold mb-2">📜 Historial de Donaciones</p>

      {/* Encabezados */}
      <div className="grid grid-cols-4 gap-3 text-xs font-semibold text-gray-400 border-b border-gray-600 pb-1 mb-2">
        <span>Nombre</span>
        <span>Estado</span>
        <span>Monto</span>
        <span>Fecha</span>
      </div>

      <ul className="flex-1 overflow-auto space-y-1 text-sm text-gray-300 pr-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className="grid grid-cols-4 gap-3 items-center border-b border-gray-700/50 py-1"
          >
            {/* Nombre o correo */}
            <span className="truncate">
              {r.nombre || r.customer_name || "Anónimo"}
            </span>

            {/* Estado */}
            <span
              className={
                r.status === "APPROVED"
                  ? "text-emerald-400"
                  : r.status === "DECLINED"
                  ? "text-rose-400"
                  : r.status === "VOIDED"
                  ? "text-yellow-400"
                  : r.status === "ERROR"
                  ? "text-red-400"
                  : "text-amber-300"
              }
            >
              {traducirEstado(r.status)}
            </span>

            {/* Monto */}
            <span>{r.montoLabel}</span>

            {/* Fecha */}
            <span className="text-gray-400 text-xs">{r.fechaLabel}</span>
          </li>
        ))}

        {rows.length === 0 && (
          <li className="text-gray-400 text-center py-2">
            Sin donaciones aún
          </li>
        )}
      </ul>
    </div>
  );
}

export default memo(HistorialBase);
