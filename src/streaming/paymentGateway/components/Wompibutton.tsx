import { useEffect, useRef } from "react";

type Props = {
  amountInCents: number;
  currency?: "COP";
  reference: string;
  redirectUrl?: string;
  expirationTimeISO?: string;
};

async function getSignature(
  reference: string,
  amountInCents: number,
  currency: "COP",
  expirationTimeISO?: string
) {
  const res = await fetch("/api/wompi/integrity", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      reference,
      amountInCents,
      currency,
      expiration: expirationTimeISO ?? null
    }),
  });
  if (!res.ok) throw new Error("integrity-error");
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
      const src = "https://checkout.wompi.co/widget.js";
      if (!document.querySelector(`script[src="${src}"]`)) {
        const loader = document.createElement("script");
        loader.src = src;
        loader.async = true;
        document.body.appendChild(loader);
        await new Promise((r) => (loader.onload = () => r(null)));
      }

      const signature = await getSignature(reference, amountInCents, currency, expirationTimeISO);

      scriptEl = document.createElement("script");
      scriptEl.setAttribute("src", src);
      scriptEl.setAttribute("data-render", "button");
      scriptEl.setAttribute("data-public-key", import.meta.env.VITE_WOMPI_PUBLIC_KEY);
      scriptEl.setAttribute("data-currency", currency);
      scriptEl.setAttribute("data-amount-in-cents", String(amountInCents));
      scriptEl.setAttribute("data-reference", reference);
      scriptEl.setAttribute("data-signature:integrity", signature);
      if (redirectUrl) scriptEl.setAttribute("data-redirect-url", redirectUrl);

      if (formRef.current) {
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
