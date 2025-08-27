import { useCallback, useMemo, useRef } from "react";

export function formatCOP(pesos: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(pesos);
}

/** Espera hasta que window.WidgetCheckout exista, cargando el script si hace falta */
let wompiReadyPromise: Promise<void> | null = null;

export function ensureWompiReady(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (wompiReadyPromise) return wompiReadyPromise;

  wompiReadyPromise = new Promise<void>((resolve, reject) => {
    // ¿Ya está disponible?
    // @ts-ignore
    if (window.WidgetCheckout) {
      resolve();
      return;
    }

    const SRC = "https://checkout.wompi.co/widget.js";
    let script = document.querySelector(`script[src="${SRC}"]`) as HTMLScriptElement | null;

    // Poll liviano por si WidgetCheckout aparece antes del onload
    let iv = window.setInterval(() => {
      // @ts-ignore
      if (window.WidgetCheckout) {
        window.clearInterval(iv);
        resolve();
      }
    }, 30);

    const done = () => {
      try { window.clearInterval(iv); } catch {}
      resolve();
    };

    const fail = (err: any) => {
      try { window.clearInterval(iv); } catch {}
      reject(err instanceof Error ? err : new Error(String(err)));
    };

    if (!script) {
      script = document.createElement("script");
      script.src = SRC;
      script.async = true;
      script.onload = done;
      script.onerror = () => fail(new Error("No se pudo cargar widget.js de Wompi"));
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", done, { once: true });
      script.addEventListener("error", () => fail(new Error("Fallo al cargar widget.js")), { once: true });
    }
  });

  return wompiReadyPromise;
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
  if (!json?.integrity) {
    throw new Error("El backend no devolvió 'integrity'.");
  }
  return json.integrity as string;
}

/** Punto único para abrir el widget (reutilizable por todos los componentes) */
export async function openWompiCheckout(opts: {
  amountInCents: number;
  currency?: "COP";
  referenceBase: string;      // base + timestamp para unicidad
  redirectUrl?: string;
  expirationTimeISO?: string;
}) {
  const currency = opts.currency ?? "COP";
  const reference = `${opts.referenceBase}-${Date.now()}`;

  const integrity = await fetchIntegrity({
    reference,
    amountInCents: opts.amountInCents,
    currency,
    expirationTimeISO: opts.expirationTimeISO,
  });

  await ensureWompiReady();

  // @ts-ignore
  const checkout = new WidgetCheckout({
    currency,
    amountInCents: opts.amountInCents,
    reference,
    publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
    signature: { integrity },
    ...(opts.redirectUrl ? { redirectUrl: opts.redirectUrl } : {}),
    ...(opts.expirationTimeISO ? { expirationTime: opts.expirationTimeISO } : {}),
  });

  checkout.open((result: any) => {
    console.log("Transaction:", result?.transaction);
  });
}

type Props = {
  amountCOP: number;
  currency?: "COP";
  reference: string;               // base ref (se le agrega timestamp al abrir)
  expirationTimeISO?: string;
  redirectUrl?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function WompiButton({
  amountCOP,
  currency = "COP",
  reference,
  expirationTimeISO,
  redirectUrl,
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
        redirectUrl,
      });
    } finally {
      openingRef.current = false;
    }
  }, [amountInCents, currency, expirationTimeISO, reference, redirectUrl]);

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
