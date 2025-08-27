// src/streaming/paymentGateway/components/WompiButton.tsx
import { useCallback, useState } from "react";

const PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY as string;

async function ensureWompiScript(): Promise<void> {
  if (typeof window === "undefined") return;
  if (document.getElementById("wompi-widget-js")) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.id = "wompi-widget-js";
    s.src = "https://checkout.wompi.co/widget.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar widget.js de Wompi"));
    document.head.appendChild(s);
  });
}

async function getIntegrity(body: {
  reference: string;
  amountInCents: number;
  currency: "COP";
  expirationTime?: string;
}): Promise<string> {
  const r = await fetch("/api/wompi/integrity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data?.integrity) {
    throw new Error(data?.error || `Error firmando (${r.status})`);
  }
  return data.integrity as string;
}

type Props = {
  amountCOP: number;              // monto en pesos
  reference: string;              // referencia única
  redirectUrl?: string;           // opcional
  expirationTime?: string;        // ISO8601 opcional
  currency?: "COP";
  className?: string;
  label?: string;
};

export default function WompiButton({
  amountCOP,
  reference,
  redirectUrl,
  expirationTime,
  currency = "COP",
  className = "",
  label = "Pagar con Wompi",
}: Props) {
  const [loading, setLoading] = useState(false);

  const onClick = useCallback(async () => {
    try {
      setLoading(true);
      await ensureWompiScript();

      const amountInCents = Math.round(Number(amountCOP) * 100);
      const freeze = {
        reference: String(reference).trim(),
        amountInCents,
        currency: "COP" as const,
        ...(expirationTime ? { expirationTime } : {}),
      };

      const integrity = await getIntegrity(freeze);

      const WidgetCheckout = (window as any).WidgetCheckout;
      if (!WidgetCheckout) throw new Error("WidgetCheckout no está disponible");

      const checkout = new WidgetCheckout({
        currency: freeze.currency,
        amountInCents: freeze.amountInCents,
        reference: freeze.reference,
        publicKey: PUBLIC_KEY,
        signature: { integrity },          // ★ según tu documentación
        ...(redirectUrl ? { redirectUrl } : {}),
        ...(expirationTime ? { expirationTime } : {}),
        // Opcionales de ejemplo:
        // customerData: { email: "...", fullName: "..." },
        // taxInCents: { vat: 1900, consumption: 800 },
        // shippingAddress: { addressLine1: "...", city: "Bogota", phoneNumber: "...", region: "Cundinamarca", country: "CO" },
      });

      console.log("[wompi] opening", {
        ...freeze,
        publicKey: PUBLIC_KEY?.slice(0, 10) + "...",
        integrityPreview: integrity.slice(0, 10),
      });

      checkout.open((result: any) => {
        console.log("Wompi result:", result);
      });
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Error abriendo Wompi");
    } finally {
      setLoading(false);
    }
  }, [amountCOP, reference, redirectUrl, expirationTime]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={
        "px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 " +
        className
      }
    >
      {loading ? "Abriendo…" : label}
    </button>
  );
}
