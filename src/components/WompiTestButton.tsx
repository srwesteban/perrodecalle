// /src/components/WompiTestButton.tsx
import { useMemo, useRef } from "react";

function currencyCOP(v: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);
}

// Carga el script del widget si hace falta
let wompiReady: Promise<void> | null = null;
function ensureWompiReady(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (wompiReady) return wompiReady;
  wompiReady = new Promise<void>((resolve, reject) => {
    // @ts-ignore
    if (window.WidgetCheckout) return resolve();
    const SRC = "https://checkout.wompi.co/widget.js";
    let script = document.querySelector(`script[src="${SRC}"]`) as HTMLScriptElement | null;
    const done = () => resolve();
    const fail = () => reject(new Error("No se pudo cargar Wompi widget"));
    if (!script) {
      script = document.createElement("script");
      script.src = SRC;
      script.async = true;
      script.onload = done;
      script.onerror = fail;
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", done, { once: true });
      script.addEventListener("error", fail, { once: true });
    }
  });
  return wompiReady;
}

async function fetchIntegrity(args: {
  reference: string;
  amountInCents: number;
  currency: string;
  expirationTime?: string;
}): Promise<string> {
  const r = await fetch("/api/wompi/integrity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reference: args.reference,
      amountInCents: args.amountInCents,
      currency: args.currency,
      expirationTime: args.expirationTime,
    }),
  });
  const j = await r.json();
  if (!j?.integrity) throw new Error("Backend no devolvió 'integrity'");
  return j.integrity;
}

type Props = {
  amountCOP: number;
  referenceBase: string; // se le agrega timestamp para unicidad
  redirectUrl?: string; // opcional
  expirationTimeISO?: string; // opcional
  className?: string;
  label?: string;
};

export default function WompiTestButton({
  amountCOP,
  referenceBase,
  redirectUrl,
  expirationTimeISO,
  className = "",
  label,
}: Props) {
  const amountInCents = useMemo(() => Math.round(amountCOP * 100), [amountCOP]);
  const opening = useRef(false);

  const onClick = async () => {
    if (opening.current) return;
    opening.current = true;
    try {
      const reference = `${referenceBase}-${Date.now()}`;
      const integrity = await fetchIntegrity({
        reference,
        amountInCents,
        currency: "COP",
        expirationTime: expirationTimeISO,
      });
      await ensureWompiReady();
      // @ts-ignore
      const checkout = new window.WidgetCheckout({
        publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
        currency: "COP",
        amountInCents,
        reference,
        signature: { integrity },
        ...(redirectUrl ? { redirectUrl } : {}),
        ...(expirationTimeISO ? { expirationTime: expirationTimeISO } : {}),
      });
      checkout.open((result: any) => {
        console.log("Transaction:", result?.transaction);
      });
    } finally {
      opening.current = false;
    }
  };

  return (
    <button type="button" onClick={onClick} className={className} aria-label={`Donar ${currencyCOP(amountCOP)}`}>
      {label ?? currencyCOP(amountCOP)}
    </button>
  );
}
