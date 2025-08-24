import { useEffect, useMemo, useRef } from "react";

type Props = {
  amountCOP: number;          // 👈 en pesos
  currency?: "COP";
  reference: string;
  redirectUrl?: string;
  expirationTimeISO?: string;
};

function toCents(cop: number) {
  return Math.round(cop * 100);
}

function formatCOP(pesos: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(pesos);
}

export default function WompiButton({
  amountCOP,
  currency = "COP",
  reference,
  redirectUrl,
  expirationTimeISO,
}: Props) {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // 👇 conversión interna
  const amountInCents = useMemo(() => toCents(amountCOP), [amountCOP]);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/wompi/integrity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          amountInCents,
          currency,
          expirationTime: expirationTimeISO,
        }),
      });
      const { integrity } = await r.json();

      if (
        !document.querySelector('script[src="https://checkout.wompi.co/widget.js"]')
      ) {
        const s = document.createElement("script");
        s.src = "https://checkout.wompi.co/widget.js";
        document.head.appendChild(s);
        await new Promise((ok) => (s.onload = ok));
      }

      if (btnRef.current) {
        btnRef.current.onclick = () => {
          // @ts-ignore: expuesto por el script de Wompi
          const checkout = new WidgetCheckout({
            currency,
            amountInCents,        // 👈 ya viene convertido
            reference,
            publicKey: import.meta.env.WOMPI_PUBLIC_KEY,
            signature: { integrity },
            ...(redirectUrl ? { redirectUrl } : {}),
            ...(expirationTimeISO ? { expirationTime: expirationTimeISO } : {}),
          });
          checkout.open((result: any) => {
            console.log("Transaction:", result?.transaction);
          });
        };
      }
    })();
  }, [amountInCents, currency, reference, redirectUrl, expirationTimeISO]);

  return (
    <button
      ref={btnRef}
      className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
    >
      {formatCOP(amountCOP)} {/* 👈 muestra pesos */}
    </button>
  );
}
