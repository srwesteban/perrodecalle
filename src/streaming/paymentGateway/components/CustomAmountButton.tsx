import { useEffect, useMemo, useState } from "react";
import { formatCOP } from "./WompiButton";

declare global { interface Window { WidgetCheckout?: any; } }

type Props = {
  referenceBase: string;
  className?: string;
  minCOP?: number;
  maxCOP?: number;
};

export default function CustomAmountButton({
  referenceBase,
  className = "",
  minCOP = 1000,
  maxCOP = 10_000_000,
}: Props) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<number | "">("");
  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY || "";

  useEffect(() => {
    let t = 0;
    const tick = () => { if (window.WidgetCheckout) setReady(true); else t = window.setTimeout(tick, 80); };
    tick(); return () => clearTimeout(t);
  }, []);

  const valid = useMemo(() => typeof value === "number" && value >= minCOP && value <= maxCOP, [value, minCOP, maxCOP]);

  const pay = () => {
    if (!ready || !publicKey || !valid || typeof value !== "number") return;
    const amountInCents = Math.round(value * 100);
    const reference = `${referenceBase}-${amountInCents}-${Date.now()}`;
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/gracias` : "";
    const checkout = new window.WidgetCheckout({ currency: "COP", amountInCents, reference, publicKey, redirectUrl });
    checkout.open(() => {}); setOpen(false); setValue("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!ready || !publicKey}
        className={[
          "inline-flex items-center justify-center select-none transition-all",
          (!ready || !publicKey) ? "opacity-50 cursor-not-allowed" : "",
          className,
        ].join(" ").trim()}
        title={!ready ? "Cargando…" : "Otro monto"}
      >
        <div className="leading-tight text-center px-2 w-full">
          <div className="text-base font-semibold truncate">Otro monto</div>
          <div className="text-[11px] opacity-90 truncate">Personaliza tu apoyo</div>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4" onClick={() => { setOpen(false); setValue(""); }}>
          <div className="w-full max-w-sm rounded-2xl bg-white text-gray-900 shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg font-semibold mb-3">Ingresa tu monto</h4>
            <label className="block text-sm mb-2">Monto en pesos (COP)</label>
            <input
              type="number" inputMode="numeric" min={minCOP} max={maxCOP} step={100}
              value={value === "" ? "" : value}
              onChange={(e) => { const v = e.target.valueAsNumber; setValue(Number.isFinite(v) ? v : ""); }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder={`${minCOP}`}
            />
            <div className="mt-2 text-xs text-gray-600">
              {typeof value === "number" && value > 0 ? `Total: ${formatCOP(value)}` : " "}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" onClick={() => { setOpen(false); setValue(""); }} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800">
                Cancelar
              </button>
              <button type="button" onClick={pay} disabled={!valid}
                className={["px-4 py-2 rounded-lg text-white", valid ? "bg-emerald-600 hover:bg-emerald-700" : "bg-emerald-600/60 cursor-not-allowed"].join(" ").trim()}>
                Pagar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
