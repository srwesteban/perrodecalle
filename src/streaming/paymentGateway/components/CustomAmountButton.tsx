// src/streaming/paymentGateway/components/CustomAmountButton.tsx
import { useMemo, useState } from "react";
import { openWompiCheckout } from "./WompiButton";

type Props = {
  referenceBase: string;
  min?: number;            // en PESOS
  max?: number;            // en PESOS
  className?: string;
  redirectUrl?: string;
  currency?: "COP" | "USD";
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
  max = 2500000,
  className = "",
  redirectUrl,
  currency = "COP",
}: Props) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");

  const valuePesos = useMemo(() => {
    const n = Number(String(raw).replace(/\D/g, "")) || 0;
    return n;
  }, [raw]);

  const disabled =
    !valuePesos || valuePesos < min || (max ? valuePesos > max : false);

  const help =
    currency === "COP"
      ? `Min: ${new Intl.NumberFormat("es-CO").format(min)} • Max: ${new Intl.NumberFormat("es-CO").format(max)}`
      : `Ingresa un monto válido`;

  async function onDonate() {
    const amountInCents = valuePesos * 100;
    try {
      await openWompiCheckout({
        amountInCents,
        currency,
        referenceBase,
        redirectUrl,
      });
      setOpen(false);
      setRaw("");
    } catch (e) {
      alert((e as Error).message);
      console.error(e);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
      >
        Donar otro monto
      </button>

      {open && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex flex-col">
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={formatPlainCOP(raw)}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="Ingresa monto en pesos"
              className="px-3 py-2 border rounded-md w-44"
            />
            <span className="text-xs text-gray-500 mt-1">{help}</span>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={onDonate}
            className={`px-4 py-2 rounded-lg font-semibold text-white ${
              disabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            title={
              disabled
                ? `El monto debe estar entre ${min} y ${max} pesos`
                : "Continuar con el pago"
            }
          >
            Pagar
          </button>
        </div>
      )}
    </div>
  );
}
