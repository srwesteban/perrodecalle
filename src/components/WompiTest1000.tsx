// src/components/WompiTest1000.tsx
import { useState, useEffect } from "react";

declare global { interface Window { WidgetCheckout: any } }

async function ensureWompiScript(): Promise<void> {
  if (window.WidgetCheckout) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.wompi.co/widget.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No cargó widget Wompi"));
    document.head.appendChild(s);
  });
}

export default function WompiTest1000() {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureWompiScript().then(() => setReady(true)).catch(console.error);
  }, []);

  const pay = async () => {
    try {
      setLoading(true);

      const amountCOP = 1000;               // 👈 fijo para esta prueba
      const amountInCents = amountCOP * 100; // 100000
      const currency = "COP";
      const reference = `TEST1000-${Date.now()}`; // 👈 fácil de ver en la BD

      // (opcional) inserta PENDING si ya tienes ese endpoint:
      // await fetch("/api/donations/pending", { method: "POST", headers: {"Content-Type": "application/json"},
      //   body: JSON.stringify({ provider: "wompi", reference, amount_in_cents: amountInCents, currency, status: "PENDING" })
      // });

      // pide firma con LOS MISMOS valores
      const r = await fetch("/api/wompi/integrity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, amountInCents, currency }),
      });
      if (!r.ok) {
        const t = await r.text();
        console.error("Integrity error:", t);
        alert("No se pudo generar la firma (integrity). Revisa variables en Vercel.");
        setLoading(false);
        return;
      }
      const { integrity } = await r.json();

      // abre widget
      const checkout = new window.WidgetCheckout({
        currency,
        amountInCents,
        reference,
        publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY, // debe ser la pub_prod
        signature: integrity,
        redirectUrl: "https://perrodecalle.vercel.app/thanks?ref=" + reference,
      });

      checkout.open(() => setLoading(false));
    } catch (e) {
      console.error(e);
      setLoading(false);
      alert("Error abriendo Wompi. Revisa consola.");
    }
  };

  return (
    <div style={{ padding: 12, border: "2px dashed #22c55e", borderRadius: 12, background: "#062" }}>
      <div style={{ color: "white", fontWeight: 700, marginBottom: 8 }}>
        🧪 SOLO PRUEBA — Wompi $1.000 COP (PROD)
      </div>
      <button
        onClick={pay}
        disabled={loading || !ready}
        style={{
          padding: "10px 16px",
          fontWeight: 700,
          background: "#34d399",
          color: "#062",
          borderRadius: 10,
          cursor: loading || !ready ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Procesando..." : "Pagar $1.000 (Wompi)"}
      </button>
      {!ready && <div style={{ color: "#fff", marginTop: 8 }}>Cargando widget…</div>}
    </div>
  );
}
