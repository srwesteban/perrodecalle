// src/streaming/paymentGateway/components/WompiButton.tsx
import React, { useCallback } from "react";

/** Utils exportables */
export function formatCOPFromCents(amountInCents: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amountInCents / 100);
}

/** Carga el script del widget una sola vez */
async function ensureWompiScript(): Promise<void> {
  if (typeof window === "undefined") return;

  const id = "wompi-widget-js";
  if (document.getElementById(id)) {
    if ((window as any).WidgetCheckout) return;
    await new Promise<void>((resolve) => {
      const i = setInterval(() => {
        if ((window as any).WidgetCheckout) {
          clearInterval(i);
          resolve();
        }
      }, 50);
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://checkout.wompi.co/widget.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar widget.js de Wompi"));
    document.head.appendChild(s);
  });

  await new Promise<void>((resolve) => {
    const i = setInterval(() => {
      if ((window as any).WidgetCheckout) {
        clearInterval(i);
        resolve();
      }
    }, 50);
  });
}

/** Llama a tu endpoint para obtener la firma (integrity) */
async function fetchIntegrity(params: {
  reference: string;
  amount_in_cents: number;
  currency: string;
  expirationTimeISO?: string;
}): Promise<{ integrity: string }> {
  const r = await fetch("/api/wompi/integrity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`No se pudo obtener integrity: ${txt}`);
  }
  return r.json();
}

/** Abre el Widget de Wompi (y registra PENDING antes) */
export async function openWompiCheckout(opts: {
  amountInCents: number;           // centavos
  currency?: "COP" | "USD";
  referenceBase: string;           // prefijo libre (p.ej. "DON")
  redirectUrl?: string;
  expirationTimeISO?: string;
}) {
  const currency = (opts.currency ?? "COP").toUpperCase();

  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY as string | undefined;
  if (!publicKey) throw new Error("Falta VITE_WOMPI_PUBLIC_KEY");

  await ensureWompiScript();

  // Genera referencia única
  const reference = `${opts.referenceBase}-${Date.now()}`;

  // 1) Registrar PENDING (no bloquea si falla)
  try {
    await fetch("/api/donations/pending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "wompi",
        reference,
        amount_in_cents: opts.amountInCents,
        currency,
      }),
    });
  } catch (e) {
    console.warn("[donations] no se pudo guardar PENDING:", e);
  }

  // 2) Obtener integrity
  const { integrity } = await fetchIntegrity({
    reference,
    amount_in_cents: opts.amountInCents,
    currency,
    expirationTimeISO: opts.expirationTimeISO,
  });

  // 3) Abrir widget
  const WidgetCheckout = (window as any).WidgetCheckout;
  const checkout = new WidgetCheckout({
    currency,
    amountInCents: opts.amountInCents,
    reference,
    publicKey,
    redirectUrl: opts.redirectUrl,
    signature: { integrity },
  });

  checkout.open(function (result: any) {
    console.log("[wompi:widget] result:", result);
    // El estado final siempre lo dará el webhook
  });
}

/** Botón genérico */
type ButtonProps = {
  amountInCents: number;  // en centavos (150000 = $1.500)
  currency?: "COP" | "USD";
  referenceBase: string;
  redirectUrl?: string;
  className?: string;
  children?: React.ReactNode;
  expirationTimeISO?: string;
};

export default function WompiButton({
  amountInCents,
  currency = "COP",
  referenceBase,
  redirectUrl,
  expirationTimeISO,
  className = "",
  children,
}: ButtonProps) {
  const onClick = useCallback(async () => {
    try {
      await openWompiCheckout({
        amountInCents,
        currency,
        referenceBase,
        redirectUrl,
        expirationTimeISO,
      });
    } catch (e) {
      alert((e as Error).message);
      console.error(e);
    }
  }, [amountInCents, currency, referenceBase, redirectUrl, expirationTimeISO]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold ${className}`}
    >
      {children ?? `Donar ${formatCOPFromCents(amountInCents)}`}
    </button>
  );
}
