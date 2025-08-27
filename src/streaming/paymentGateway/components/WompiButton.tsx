import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    WidgetCheckout?: any;
  }
}

/** Formatea COP de forma compacta y bonita */
export function formatCOP(value: number) {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString("es-CO")} COP`;
  }
}

type Props = {
  amountCOP: number;                 // monto en pesos
  reference: string;                 // referencia base (yo la haré única en el click)
  redirectUrl?: string;              // opcional
  currency?: "COP";
  className?: string;
  children?: React.ReactNode;        // tu contenido (el div con títulos)
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

  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY || ""; // ⚠️ DEBE existir en Vercel

  // Convierto a centavos internamente (evita errores en props)
  const amountInCents = useMemo(() => Math.max(0, Math.round(amountCOP * 100)), [amountCOP]);

  // Espero el script del widget
  useEffect(() => {
    let t = 0;
    const tick = () => {
      if (window.WidgetCheckout) setReady(true);
      else t = window.setTimeout(tick, 80);
    };
    tick();
    return () => window.clearTimeout(t);
  }, []);

  const onPay = () => {
    if (!window.WidgetCheckout) return;
    if (!publicKey) {
      console.error("Falta VITE_WOMPI_PUBLIC_KEY");
      alert("No se pudo iniciar el pago (clave pública ausente).");
      return;
    }
    if (!amountInCents) return;

    // Genero referencia ÚNICA en el click, tomando tu base
    const finalReference = `${reference}-${amountInCents}-${Date.now()}`;

    const checkout = new window.WidgetCheckout({
      currency,
      amountInCents,
      reference: finalReference,
      publicKey,
      redirectUrl,
    });

    checkout.open((result: any) => {
      // Puedes leer result si quieres (success/cancel)
      // console.log(result);
    });
  };

  const disabled = !ready || !publicKey || !amountInCents;

  return (
    <button
      type="button"
      onClick={onPay}
      disabled={disabled}
      className={
        [
          "inline-flex items-center justify-center select-none transition-all",
          disabled ? "opacity-50 cursor-not-allowed" : "",
          className || "",
        ].join(" ").trim()
      }
      // title para accesibilidad; no cambia cursor a pointer a menos que tu clase lo haga
      title={disabled ? "Cargando…" : "Pagar con Wompi"}
    >
      {/* Si quieres mostrar estado, podrías condicionar aquí; por ahora renderizo tus children fijo */}
      {children ?? <span className="text-sm font-semibold">{formatCOP(amountCOP)}</span>}
    </button>
  );
}
