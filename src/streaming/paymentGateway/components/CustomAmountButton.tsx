// src/components/CustomAmountButton.tsx
import { useMemo, useState } from "react";
import { formatCOP, openWompiCheckout } from "../components/Wompibutton";

type Props = {
  referenceBase: string;  // genera referencias únicas por transacción
  min?: number;           // mínimo permitido (por defecto 1.500)
  className?: string;     // estilos del botón (mismo peso visual)
};

// "444444" -> "444.444" (sin $)
function formatPlainCOP(n: number | string) {
  const digits = String(n).replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(Number(digits));
}

export default function CustomAmountButton({
  referenceBase,
  min = 1500,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [valueStr, setValueStr] = useState(""); // siempre formateado con puntos

  // valor numérico a partir del string formateado
  const value = useMemo(() => {
    const n = Number(valueStr.replace(/\D/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }, [valueStr]);

  // ✅ solo restricciones de mínimo (no hay máximo)
  const error =
    !valueStr
      ? ""
      : Number.isNaN(value)
      ? "Valor inválido"
      : value < min
      ? `El mínimo es ${formatCOP(min)}`
      : "";

  // Formatea mientras escribe (con puntos), sin límite superior
  function onChangeRaw(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "");
    setValueStr(formatPlainCOP(digits));
  }

  async function confirm() {
    if (error || !value) return;
    await openWompiCheckout({
      amountInCents: Math.round(value * 100),
      currency: "COP",
      referenceBase,
    });
    setOpen(false);
    setValueStr("");
  }

  return (
    <>
      {/* Botón que abre el popup */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        aria-label="Donar otro monto"
      >
        <div className="leading-tight text-center">
          <div className="text-base font-semibold">Otro monto</div>
          <div className="text-[11px] opacity-90">Elige tu aporte</div>
        </div>
      </button>

      {/* Popup */}
      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-[92vw] max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white shadow-xl">
            <h4 className="text-sm font-semibold">Escribe tu donación</h4>
            <p className="text-xs text-white/70">
              Mín. {formatCOP(min)}
            </p>

            <div className="mt-3">
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Ej: 15.000"
                className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-emerald-400"
                value={valueStr}
                onChange={onChangeRaw}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
                  setValueStr(formatPlainCOP(text));
                }}
              />
              {error ? (
                <p className="mt-1 text-[11px] text-red-300">{error}</p>
              ) : valueStr ? (
                <p className="mt-1 text-[11px] text-white/80">
                  Vas a donar <b>{formatCOP(value || 0)}</b>
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 h-10 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!!error || !value}
                onClick={confirm}
                className="flex-1 h-10 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Donar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
