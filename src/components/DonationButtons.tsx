// src/components/DonationButtons.tsx
import { useState } from "react";

// Cárgalo en index.html: <script src="https://cdn.wompi.co/widget.js"></script>
// o dinámicamente si prefieres.

type Props = {
  publicKey: string; // ej: import.meta.env.VITE_WOMPI_PUB
  redirectUrl: string; // a dónde vuelve el usuario tras pagar
  amounts: number[];   // [2500, 5000, 10000]
  dogId?: string;      // si quieres asociar a un perro
};

declare global {
  interface Window {
    WidgetCheckout: any;
  }
}

export default function DonationButtons({ publicKey, redirectUrl, amounts, dogId }: Props) {
  const [pendingRef, setPendingRef] = useState<string | null>(null);

  async function startPayment(amount: number) {
    const reference = `REF-${Date.now()}-${amount}`;
    setPendingRef(reference);

    // Pide la firma de integridad a tu backend
    const sigRes = await fetch("/api/wompi/integrity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        amountInCents: amount * 100,
        currency: "COP",
        meta: { dogId: dogId ?? null },
      }),
    });

    if (!sigRes.ok) {
      alert("Error generando firma");
      setPendingRef(null);
      return;
    }
    const { integrity } = await sigRes.json();

    const checkout = new window.WidgetCheckout({
      currency: "COP",
      amountInCents: amount * 100,
      reference,
      publicKey,
      redirectUrl,
      // Wompi exige la firma de integridad:
      signature: {
        integrity,
      },
    });

    checkout.open((result: any) => {
      // El resultado inmediato no es definitivo; lo definitivo llega por webhook.
      // Puedes mostrar un "Procesando..." y esperar confirmación servidor → cliente.
      console.log("Widget result:", result);
    });
  }

  return (
    <div className="flex gap-3 flex-wrap">
      {amounts.map((amt) => {
        const refIsThis = pendingRef?.includes(`-${amt}-`);
        return (
          <button
            key={amt}
            onClick={() => startPayment(amt)}
            disabled={refIsThis} // se re-habilita cuando el backend confirme APPROVED
            className={`px-4 py-2 rounded-lg border ${refIsThis ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-50"}`}
            aria-busy={refIsThis}
          >
            {refIsThis ? "Procesando..." : `Donar $${amt.toLocaleString("es-CO")}`}
          </button>
        );
      })}

      {/* Bold 65k fijo */}
      <a
        href="https://checkout.bold.co/payment/LNK_W2X05N65YO"
        target="_blank"
        rel="noreferrer"
        className="px-4 py-2 rounded-lg border hover:bg-gray-50"
      >
        Donar $65.000 (Bold)
      </a>
    </div>
  );
}
