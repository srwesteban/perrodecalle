// src/streaming/paymentGateway/components/WompiButton.tsx
import { useCallback, useMemo, useRef } from "react";

export function formatCOP(pesos: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(pesos);
}

// Carga el script de Wompi una sola vez
let wompiScriptPromise: Promise<void> | null = null;
export function ensureWompiScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (wompiScriptPromise) return wompiScriptPromise;

  if (document.querySelector('script[src="https://checkout.wompi.co/widget.js"]')) {
    wompiScriptPromise = Promise.resolve();
    return wompiScriptPromise;
  }

  wompiScriptPromise = new Promise<void>((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.wompi.co/widget.js";
    s.async = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });

  return wompiScriptPromise;
}

async function fetchIntegrity(params: {
  reference: string;
  amountInCents: number;
  currency: string;
  expirationTimeISO?: string;
}) {
  const r = await fetch("/api/wompi/integrity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reference: params.reference,
      amountInCents: params.amountInCents,
      currency: params.currency,
      expirationTime: params.expirationTimeISO,
    }),
  });
  const json = await r.json();
  return json?.integrity as string;
}

// 👉 helper que puedes usar desde otros componentes (como el popup)
export async function openWompiCheckout(opts: {
  amountInCents: number;
  currency?: "COP";
  referenceBase: string;      // se le agrega timestamp para unicidad
  expirationTimeISO?: string;
}) {
  const currency = opts.currency ?? "COP";
  const reference = `${opts.referenceBase}-${Date.now()}`; // ref única por click
  const integrity = await fetchIntegrity({
    reference,
    amountInCents: opts.amountInCents,
    currency,
    expirationTimeISO: opts.expirationTimeISO,
  });

  await ensureWompiScript();
  // @ts-ignore
  const checkout = new WidgetCheckout({
    currency,
    amountInCents: opts.amountInCents,
    reference,
    publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
    signature: { integrity },
    ...(opts.expirationTimeISO ? { expirationTime: opts.expirationTimeISO } : {}),
  });
  checkout.open((result: any) => {
    console.log("Transaction:", result?.transaction);
  });
}

type Props = {
  amountCOP: number;
  currency?: "COP";
  reference: string;               // base ref para este botón
  expirationTimeISO?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function WompiButton({
  amountCOP,
  currency = "COP",
  reference,
  expirationTimeISO,
  className = "",
  children,
}: Props) {
  const amountInCents = useMemo(() => Math.round(amountCOP * 100), [amountCOP]);
  const openingRef = useRef(false);

  const handleClick = useCallback(async () => {
    if (openingRef.current) return;
    openingRef.current = true;
    try {
      await openWompiCheckout({
        amountInCents,
        currency,
        referenceBase: reference,
        expirationTimeISO,
      });
    } finally {
      openingRef.current = false;
    }
  }, [amountInCents, currency, expirationTimeISO, reference]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-label={`Donar ${formatCOP(amountCOP)}`}
    >
      {children ?? formatCOP(amountCOP)}
    </button>
  );
}
