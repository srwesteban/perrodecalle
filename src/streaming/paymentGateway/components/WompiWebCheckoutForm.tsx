// src/streaming/paymentGateway/components/WompiWebCheckoutForm.tsx
import { useState } from "react";
const PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY as string;

async function getIntegrity(body: { reference: string; amountInCents: number; currency: "COP"; expirationTime?: string; }) {
  const r = await fetch("/api/wompi/integrity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok || !data?.integrity) throw new Error(data?.error || "No integrity");
  return data.integrity as string;
}

type Props = {
  amountCOP: number;
  reference: string;
  redirectUrl?: string;
  expirationTime?: string;
};

export default function WompiWebCheckoutForm({ amountCOP, reference, redirectUrl, expirationTime }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const amountInCents = Math.round(amountCOP * 100);
      const integrity = await getIntegrity({
        reference,
        amountInCents,
        currency: "COP",
        ...(expirationTime ? { expirationTime } : {}),
      });

      const form = e.currentTarget;
      (form.elements.namedItem("public-key") as HTMLInputElement).value = PUBLIC_KEY;
      (form.elements.namedItem("currency") as HTMLInputElement).value = "COP";
      (form.elements.namedItem("amount-in-cents") as HTMLInputElement).value = String(amountInCents);
      (form.elements.namedItem("reference") as HTMLInputElement).value = reference;
      (form.elements.namedItem("signature:integrity") as HTMLInputElement).value = integrity;
      if (redirectUrl) (form.elements.namedItem("redirect-url") as HTMLInputElement).value = redirectUrl;
      if (expirationTime) (form.elements.namedItem("expiration-time") as HTMLInputElement).value = expirationTime;

      form.submit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form action="https://checkout.wompi.co/p/" method="GET" onSubmit={onSubmit}>
      {/* OBLIGATORIOS */}
      <input type="hidden" name="public-key" />
      <input type="hidden" name="currency" />
      <input type="hidden" name="amount-in-cents" />
      <input type="hidden" name="reference" />
      <input type="hidden" name="signature:integrity" />
      {/* OPCIONALES */}
      <input type="hidden" name="redirect-url" />
      <input type="hidden" name="expiration-time" />
      <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-sky-600 text-white">
        {submitting ? "Abriendo…" : "Pagar con Wompi (Web Checkout)"}
      </button>
    </form>
  );
}
