// src/components/DonateButton.tsx
import { useState } from "react";
import { supabase } from "../lib/supabase";

// Declara el constructor global del widget con tipos mínimos
type WompiStatus = "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
type WompiResult = { transaction?: { id?: string; status?: WompiStatus } };

interface WompiCheckoutCtor {
  new (opts: {
    currency: "COP";
    amountInCents: number;
    reference: string;
    publicKey: string;
    signature: { integrity: string };
    redirectUrl?: string;
  }): {
    open(cb: (result: WompiResult) => void): void;
  };
}

// ⬇️ El script <script src="https://checkout.wompi.co/widget.js"> define esto en runtime
declare const WidgetCheckout: WompiCheckoutCtor;

export default function DonateButton({ defaultAmount = 5000 }: { defaultAmount?: number }) {
  const [loading, setLoading] = useState(false);

  async function onDonate() {
    setLoading(true);
    try {
      const amountInCents = defaultAmount * 100;
      const reference = `don-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

      // 1) pedir firma al Edge
      const sigRes = await fetch("/api/wompi/integrity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reference, amountInCents, currency: "COP" }),
      });
      const { signature } = await sigRes.json();

      // 2) abrir widget
      const checkout = new WidgetCheckout({
        currency: "COP",
        amountInCents,
        reference,
        publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY, // pub_test_...
        signature: { integrity: signature },
      });

      // 3) guardar PENDING para que la UI lo vea de una
      checkout.open(async (result) => {
        const tx = result?.transaction;
        await supabase.from("donations").insert({
          reference,
          amount_in_cents: amountInCents,
          currency: "COP",
          status: (tx?.status as WompiStatus) ?? "PENDING",
          tx_id: tx?.id ?? null,
        });
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onDonate}
      disabled={loading}
      className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
    >
      {loading ? "Abriendo..." : "Donar con Wompi"}
    </button>
  );
}
