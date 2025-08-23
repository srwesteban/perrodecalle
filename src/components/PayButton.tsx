// /components/PayButton.tsx  (misma API que usas con Bold)
import { useState } from "react";
declare global { interface Window { WidgetCheckout: any } }

type Props = {
  provider: "bold" | "wompi";
  amountCOP: number;
  dogId?: string;
  onPending?: (ref: string) => void;
};

const PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY || (window as any).ENV?.WOMPI_PUBLIC_KEY;

export default function PayButton({ provider, amountCOP, dogId, onPending }: Props) {
  const [loading, setLoading] = useState(false);

  const payWompi = async () => {
    try {
      setLoading(true);

      // 1) referencia igual a Bold (patrón timestamp)
      const reference = `DON-${dogId ?? "ref"}-${Date.now()}`;
      const amountInCents = amountCOP * 100;

      // 2) (igual que Bold) registrar PENDING antes de salir
      await fetch("/api/donations/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "wompi",
          reference,
          amount_in_cents: amountInCents,
          currency: "COP",
          dog_id: dogId ?? null,
          status: "PENDING",
        }),
      });
      onPending?.(reference);

      // 3) pedir integridad al backend (igual que Bold pide firma)
      const sigRes = await fetch("/api/wompi/integrity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, amountInCents, currency: "COP" }),
      });
      const { integrity } = await sigRes.json();

      // 4) abrir widget con mismo redirect que usas con Bold
      const checkout = new window.WidgetCheckout({
        currency: "COP",
        amountInCents,
        reference,
        publicKey: PUBLIC_KEY,
        signature: integrity,
        redirectUrl: "https://perrodecalle.vercel.app/thanks?provider=wompi&ref=" + reference,
      });

      checkout.open(() => {
        // igual que Bold: el estado final lo deja el webhook
        setLoading(false);
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (provider === "wompi") {
    return (
      <button disabled={loading} onClick={payWompi}>
        {loading ? "Procesando..." : `Donar $${amountCOP.toLocaleString()} (Wompi)`}
      </button>
    );
  }

  // si llamas el mismo componente con Bold, dejas tu implementación actual
  return null;
}
