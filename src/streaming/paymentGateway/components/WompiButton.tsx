// src/streaming/paymentGateway/components/WompiButton.tsx
import { useCallback } from "react";

/** Utils exportables */
export function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Construye URL absoluta a /api (sirve en producción y local) */
function apiUrl(path: string) {
  if (typeof window !== "undefined") return `${window.location.origin}${path}`;
  return path;
}

/** Carga el script del widget una sola vez */
async function ensureWompiScript(): Promise<void> {
  if (typeof window === "undefined") return;
  const id = "wompi-widget-js";
  if (document.getElementById(id)) return;

  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://checkout.wompi.co/widget.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar widget.js de Wompi"));
    document.head.appendChild(s);
  });
}

/** Llama a tu endpoint para obtener la firma */
async function fetchIntegrity(params: {
  reference: string;
  amountInCents: number;
  currency: string;
  expirationTimeISO?: string;
}): Promise<string> {
  const r = await fetch(apiUrl("/api/wompi/integrity"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reference: params.reference,
      amountInCents: params.amountInCents,
      currency: params.currency,
      expirationTime: params.expirationTimeISO,
    }),
  });

  if (!r.ok) {
    console.error("Wompi integrity endpoint falló:", r.status, await r.text());
    throw new Error("No se pudo generar la firma de integridad");
  }

  const j = (await r.json()) as { integrity?: string };
  if (!j?.integrity) throw new Error("Firma de integridad vacía");
  return j.integrity;
}

/** API exportable que usa referenceBase (tal como la llamas en CustomAmountButton) */
export async function openWompiCheckout(opts: {
  amountInCents: number;
  currency?: "COP";
  referenceBase: string;
  redirectUrl?: string;
  expirationTimeISO?: string;
}) {
  const currency = opts.currency ?? "COP";
  const uniqueReference = `${opts.referenceBase}-${Date.now()}`;

  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY as string;
  if (!publicKey) throw new Error("VITE_WOMPI_PUBLIC_KEY no está definida");

  await ensureWompiScript();

  // @ts-ignore
  const WidgetCheckout = (window as any).WidgetCheckout;
  if (!WidgetCheckout) throw new Error("WidgetCheckout no disponible");

  const signature = await fetchIntegrity({
    reference: uniqueReference,
    amountInCents: opts.amountInCents,
    currency,
    expirationTimeISO: opts.expirationTimeISO,
  });

  // @ts-ignore
  const checkout = new WidgetCheckout({
    currency,
    amountInCents: opts.amountInCents,
    reference: uniqueReference,
    publicKey,
    signature: { integrity: signature },
    ...(opts.redirectUrl ? { redirectUrl: opts.redirectUrl } : {}),
    ...(opts.expirationTimeISO ? { expirationTime: opts.expirationTimeISO } : {}),
  });

  checkout.open((result: any) => {
    console.log("Wompi transaction:", result?.transaction);
  });
}

/** ====== Componente de botón por defecto (tu API original) ====== */
type ButtonProps = {
  amountCOP: number;              // monto en pesos
  currency?: "COP";
  reference: string;              // base de referencia
  redirectUrl?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function WompiButton({
  amountCOP,
  currency = "COP",
  reference,
  redirectUrl,
  className = "",
  children,
}: ButtonProps) {
  const onClick = useCallback(async () => {
    try {
      const amountInCents = Math.round(amountCOP * 100);
      console.log(
        "Wompi env:",
        (import.meta as any).env.VITE_WOMPI_PUBLIC_KEY?.startsWith("pub_test_")
          ? "SANDBOX"
          : "PRODUCCIÓN"
      );

      await openWompiCheckout({
        amountInCents,
        currency,
        referenceBase: reference,
        redirectUrl,
      });
    } catch (e) {
      console.error(e);
      alert("No se pudo iniciar el pago. Intenta de nuevo.");
    }
  }, [amountCOP, currency, reference, redirectUrl]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className ||
        "px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
      }
    >
      {children ?? `Pagar ${formatCOP(amountCOP)}`}
    </button>
  );
}
