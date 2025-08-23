// /components/WompiPayButton.tsx
import { useState } from "react";
declare global { interface Window { WidgetCheckout: any } }

const PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY;

export default function WompiPayButton({ amountCOP = 10000 }: { amountCOP?: number }) {
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    try {
      setLoading(true);

      // referencia única, global a la fundación
      const reference = `FOUND-${Date.now()}`;
      const amountInCents = amountCOP * 100;

      // insertar registro PENDING (igual que Bold pero sin dogId)
      await fetch("/api/donations/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "wompi",
          reference,
          amount_in_cents: amountInCents,
          currency: "COP",
          status: "PENDING",
        }),
      });

      // pedir integridad al backend
      const sigRes = await fetch("/api/wompi/integrity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, amountInCents, currency: "COP" }),
      });
      const { integrity } = await sigRes.json();

      // abrir widget de Wompi
      const checkout = new window.WidgetCheckout({
        currency: "COP",
        amountInCents,
        reference,
        publicKey: PUBLIC_KEY,
        signature: integrity,
        redirectUrl: "https://perrodecalle.vercel.app/thanks?provider=wompi&ref=" + reference,
      });

      checkout.open(() => {
        setLoading(false);
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <button disabled={loading} onClick={pay}>
      {loading ? "Procesando..." : `Donar $${amountCOP.toLocaleString()} (Wompi)`}
    </button>
  );
}
