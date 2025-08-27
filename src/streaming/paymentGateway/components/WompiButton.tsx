import { useCallback, useState } from "react";

// Carga el widget una sola vez
async function ensureWompiScript() {
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

// Pide la firma a tu backend
async function getSignature(body: {
  reference: string;
  amountInCents: number;
  currency: "COP";
}): Promise<string> {
  const r = await fetch("/api/wompi/integrity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || `Error ${r.status}`);
  }
  const data = await r.json();
  return data.signature as string;
}

type Props = {
  amountCOP: number;       // en pesos
  reference: string;       // DON-<algo único>
  publicKey: string;       // pub_test_xxx o pub_prod_xxx
  currency?: "COP";
  redirectUrl?: string;
  className?: string;
};

export default function WompiButton({
  amountCOP,
  reference,
  publicKey,
  currency = "COP",
  redirectUrl,
  className = "",
}: Props) {
  const [loading, setLoading] = useState(false);

  const onClick = useCallback(async () => {
    try {
      setLoading(true);
      await ensureWompiScript();

      const amountInCents = Math.round(amountCOP * 100);
      const signature = await getSignature({ reference, amountInCents, currency });

      const WidgetCheckout = (window as any).WidgetCheckout;
      if (!WidgetCheckout) throw new Error("WidgetCheckout no está disponible");

      const checkout = new WidgetCheckout({
        currency,
        amountInCents,
        reference,
        publicKey,
        redirectUrl,
        signature, // 👈 clave para evitar el error
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
  }, [amountCOP, reference, publicKey, currency, redirectUrl]);

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
      {loading ? "Abriendo…" : `Donar $${amountCOP.toLocaleString("es-CO")}`}
    </button>
  );
}
