import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window { WidgetCheckout?: any; }
}

export function formatCOP(value: number) {
  try {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
  } catch { return `${value.toLocaleString("es-CO")} COP`; }
}

type Props = {
  amountCOP: number;
  reference: string;
  redirectUrl?: string;
  currency?: "COP";
  className?: string;
  children?: React.ReactNode;
};

export default function WompiButton({
  amountCOP,
  reference,
  redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/gracias` : "",
  currency = "COP",
  className = "",
  children,
}: Props) {
  const [ready, setReady] = useState(false);
  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY || "";
  const amountInCents = useMemo(() => Math.max(0, Math.round(amountCOP * 100)), [amountCOP]);

  useEffect(() => {
    let t = 0;
    const tick = () => { if (window.WidgetCheckout) setReady(true); else t = window.setTimeout(tick, 80); };
    tick(); return () => clearTimeout(t);
  }, []);

  const onPay = () => {
    if (!window.WidgetCheckout || !publicKey || !amountInCents) return;
    const finalReference = `${reference}-${amountInCents}-${Date.now()}`;
    const checkout = new window.WidgetCheckout({ currency, amountInCents, reference: finalReference, publicKey, redirectUrl });
    checkout.open(() => {});
  };

  const disabled = !ready || !publicKey || !amountInCents;

  return (
    <button
      type="button"
      onClick={onPay}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center select-none transition-all",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      ].join(" ").trim()}
      title={disabled ? "Cargando…" : "Pagar con Wompi"}
    >
      {children ?? <span className="text-sm font-semibold">{formatCOP(amountCOP)}</span>}
    </button>
  );
}
