import { useEffect, useRef } from "react";

type Props = {
  amountInCents: number;          // ej: 10000 => $100 COP
  currency?: "COP";
  reference: string;              // referencia ÚNICA por pago
  redirectUrl?: string;           // opcional: a dónde regresa tras pagar
  expirationTimeISO?: string;     // opcional: ISO8601 UTC si quieres expiración
};

async function getSignature(
  reference: string,
  amountInCents: number,
  currency: "COP",
  expirationTimeISO?: string
) {
  const res = await fetch("/api/wompi/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference, amountInCents, currency, expirationTimeISO }),
  });
  if (!res.ok) throw new Error("No se pudo generar la firma");
  const { signature } = await res.json();
  return signature as string;
}

export default function WompiButton({
  amountInCents,
  currency = "COP",
  reference,
  redirectUrl,
  expirationTimeISO,
}: Props) {
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    let scriptEl: HTMLScriptElement | null = null;

    (async () => {
      // 1) Cargar el script del widget si no existe
      const src = "https://checkout.wompi.co/widget.js";
      if (!document.querySelector(`script[src="${src}"]`)) {
        const loader = document.createElement("script");
        loader.src = src;
        loader.async = true;
        document.body.appendChild(loader);
        await new Promise((r) => (loader.onload = () => r(null)));
      }

      // 2) Pedir firma al backend
      const signature = await getSignature(reference, amountInCents, currency, expirationTimeISO);

      // 3) Crear el <script data-...> que renderiza el botón
      scriptEl = document.createElement("script");
      scriptEl.setAttribute("src", src);
      scriptEl.setAttribute("data-render", "button");
      scriptEl.setAttribute("data-public-key", import.meta.env.VITE_WOMPI_PUBLIC_KEY);
      scriptEl.setAttribute("data-currency", currency);
      scriptEl.setAttribute("data-amount-in-cents", String(amountInCents));
      scriptEl.setAttribute("data-reference", reference);
      scriptEl.setAttribute("data-signature:integrity", signature);
      if (redirectUrl) scriptEl.setAttribute("data-redirect-url", redirectUrl);

      // Montar dentro del <form>
      if (formRef.current) {
        // limpiar previos si re-renderiza
        formRef.current.innerHTML = "";
        formRef.current.appendChild(scriptEl);
      }
    })();

    return () => {
      if (scriptEl && scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl);
    };
  }, [amountInCents, currency, reference, redirectUrl, expirationTimeISO]);

  return <form ref={formRef} />;
}
