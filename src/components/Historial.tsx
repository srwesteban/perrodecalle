import { memo, useEffect, useState } from "react";
import { useDonations } from "../hooks/useDonations";
import ConfettiController from "./ConfettiController";

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
  const rows = useDonations(50);
  const [confettiActive, setConfettiActive] = useState(false);

  // 👇 activar confetti si entra una transacción aprobada
  useEffect(() => {
    if (rows.length === 0) return;

    const ultima = rows[0]; // la más reciente
    if (ultima.status === "APPROVED") {
      setConfettiActive(true);
    }
  }, [rows]);

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-xl p-3">
      <p className="font-bold mb-2">📜 Historial de Donaciones</p>

      {/* Tabla simple */}
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
            <span className="truncate">{r.customer_name ?? "Anónimo"}</span>
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
              {traducirEstado(r.status)}
            </span>
            <span>{r.amountFormatted}</span>
            <span className="text-gray-400 text-xs">
              {new Date(r.updated_at ?? r.created_at).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </li>
        ))}

        {rows.length === 0 && (
          <li className="text-gray-400 text-center py-2">
            Sin donaciones aún
          </li>
        )}
      </ul>

      {/* 🎉 Confetti controlado */}
      <ConfettiController
        active={confettiActive}
        durationMs={5000}
        onDone={() => setConfettiActive(false)}
      />
    </div>
  );
}

export default memo(HistorialBase);
