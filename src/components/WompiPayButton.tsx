import { useMemo, useRef } from "react";

// 👉 esto hace que TS reconozca WidgetCheckout sin quejarse
declare global {
  interface Window {
    WidgetCheckout: any;
  }
}

function currencyCOP(v: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(v);
}

let wompiReady: Promise<void> | null = null;
function ensureWompiReady(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (wompiReady) return wompiReady;
  wompiReady = new Promise<void>((resolve, reject) => {
    if (window.WidgetCheckout) return resolve();
    const SRC = "https://checkout.wompi.co/widget.js";
    let script = document.querySelector(
      `script[src="${SRC}"]`
    ) as HTMLScriptElement | null;
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

// helper para redirecciones absolutas
function resolveRedirect(redirectUrl?: string) {
  if (!redirectUrl) return undefined;
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : import.meta.env.VITE_SITE_URL || "";
  const abs = redirectUrl.startsWith("http")
    ? redirectUrl
    : origin.replace(/\/$/, "") +
      (redirectUrl.startsWith("/") ? redirectUrl : `/${redirectUrl}`);
  return abs.startsWith("https://") ? abs : undefined;
}

type Props = {
  amountCOP: number;
  referenceBase: string; // base + timestamp
  label?: string;
  className?: string;
  redirectUrl?: string;
  expirationTimeISO?: string;
  onResult?: (tx?: any) => void;
};

export default function WompiPayButton({
  amountCOP,
  referenceBase,
  label,
  className = "",
  redirectUrl,
  expirationTimeISO,
  onResult,
}: Props) {
  const amountInCents = useMemo(() => Math.round(amountCOP * 100), [amountCOP]);
  const opening = useRef(false);

  const onClick = async () => {
    if (opening.current) return;
    opening.current = true;

    const reference = `${referenceBase}-${Date.now()}`;
    try {
      const integrity = await fetchIntegrity({
        reference,
        amountInCents,
        currency: "COP",
        expirationTime: expirationTimeISO,
      });

      await ensureWompiReady();

      const cfg: any = {
        publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
        currency: "COP",
        amountInCents,
        reference,
        signature: { integrity },
      };

      const redirectAbs = resolveRedirect(redirectUrl);
      if (redirectAbs) cfg.redirectUrl = redirectAbs;
      if (expirationTimeISO) cfg.expirationTime = expirationTimeISO;

      const checkout = new window.WidgetCheckout(cfg);
      checkout.open((result: any) => onResult?.(result?.transaction));
    } finally {
      opening.current = false;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow ${className}`}
      aria-label={`Donar ${currencyCOP(amountCOP)}`}
    >
      {label ?? currencyCOP(amountCOP)}
    </button>
  );
}
