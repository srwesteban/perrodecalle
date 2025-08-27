import React, { useCallback } from "react";

/* ========= Utils exportables ========= */
export function formatCOP(pesos: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(pesos);
}

export function formatCOPFromCents(amountInCents: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amountInCents / 100);
}

/* ========= Carga del script ========= */
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

/* ========= Firma de integridad ========= */
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

/* ========= Abrir checkout ========= */
export async function openWompiCheckout(opts: {
  amountInCents: number;           // CENTAVOS
  currency?: "COP" | "USD";
  referenceBase: string;           // base para generar referencia única
  redirectUrl?: string;
  expirationTimeISO?: string;
}) {
  const currency = (opts.currency ?? "COP").toUpperCase();
  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY as string | undefined;
  if (!publicKey) throw new Error("Falta VITE_WOMPI_PUBLIC_KEY");

  await ensureWompiScript();

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

  // 2) Firma
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

  checkout.open((result: any) => {
    console.log("[wompi:widget] result:", result);
  });
}

/* ========= Props =========
   Mantengo tus estilos por className.
   Alias aceptados:
   - amountCOP (pesos)  ó  amountInCents (centavos)
   - reference (alias de referenceBase)
*/
type ButtonProps = {
  amountCOP?: number;
  amountInCents?: number;
  currency?: "COP" | "USD";
  reference?: string;          // alias: lo usas como "base"
  referenceBase?: string;      // nombre canónico
  redirectUrl?: string;
  className?: string;
  children?: React.ReactNode;
  expirationTimeISO?: string;
};

/* ========= Componente ========= */
export default function WompiButton({
  amountCOP,
  amountInCents,
  currency = "COP",
  reference,
  referenceBase,
  redirectUrl,
  expirationTimeISO,
  className = "",
  children,
}: ButtonProps) {
  // Normalización de montos
  const hasPesos = typeof amountCOP === "number";
  const hasCents = typeof amountInCents === "number";
  if (!hasPesos && !hasCents) {
    throw new Error("WompiButton: pasa amountCOP (pesos) o amountInCents (centavos).");
  }
  const normalizedInCents = hasCents
    ? Math.round(amountInCents as number)
    : Math.round((amountCOP as number) * 100);

  // Texto del botón en pesos
  const labelPesos = hasPesos
    ? (amountCOP as number)
    : Math.round(normalizedInCents / 100);

  // La base de la referencia (acepta alias "reference")
  const base = (reference ?? referenceBase) || "DON";

  const onClick = useCallback(async () => {
    try {
      await openWompiCheckout({
        amountInCents: normalizedInCents,
        currency,
        referenceBase: base,
        redirectUrl,
        expirationTimeISO,
      });
    } catch (e) {
      alert((e as Error).message);
      console.error(e);
    }
  }, [normalizedInCents, currency, base, redirectUrl, expirationTimeISO]);

  // ✅ Estilos los controlas tú con className (no los toco)
  return (
    <button type="button" onClick={onClick} className={className}>
      {children ?? (
        <div className="leading-tight text-center px-2 w-full">
          <div className="text-base font-semibold truncate">{formatCOP(labelPesos)}</div>
        </div>
      )}
    </button>
  );
}
