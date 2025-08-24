import { useEffect, useMemo, useRef } from "react";
import Button from "@mui/material/Button";

type Props = {
  amountCOP: number; // en pesos
  currency?: "COP";
  reference: string;
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
  expirationTimeISO,
}: Props) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
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
        !document.querySelector(
          'script[src="https://checkout.wompi.co/widget.js"]'
        )
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
            amountInCents,
            reference,
            publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
            signature: { integrity },
            ...(expirationTimeISO ? { expirationTime: expirationTimeISO } : {}),
          });
          checkout.open((result: any) => {
            console.log("Transaction:", result?.transaction);
          });
        };
      }
    })();
  }, [amountInCents, currency, reference, expirationTimeISO]);

  return <Button ref={btnRef}>{formatCOP(amountCOP)}</Button>;
}
