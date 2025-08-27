import { useEffect, useRef } from "react";

type Props = {
  amountInCents: number;        // en centavos
  currency?: "COP";
  reference: string;
  redirectUrl?: string;
  expirationTimeISO?: string;   // opcional
};

export default function WompiButton({
  amountInCents,
  currency = "COP",
  reference,
  redirectUrl,
  expirationTimeISO,
}: Props) {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    (async () => {
      // 1) pide firma al backend
      const r = await fetch("/api/wompi/integrity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          amountInCents,
          currency,
          expirationTime: expirationTimeISO, // debe coincidir
        }),
      });
      const { integrity } = await r.json();

      // 2) carga el widget una sola vez
      if (!document.querySelector('script[src="https://checkout.wompi.co/widget.js"]')) {
        const s = document.createElement("script");
        s.src = "https://checkout.wompi.co/widget.js";
        document.head.appendChild(s);
        await new Promise((ok) => (s.onload = ok));
      }

      // 3) asigna handler al botón
      if (btnRef.current) {
        btnRef.current.onclick = () => {
          // @ts-ignore – lib global
          const checkout = new WidgetCheckout({
            currency,
            amountInCents,
            reference,
            publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
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
      Donar con Wompi
    </button>
  );
}
