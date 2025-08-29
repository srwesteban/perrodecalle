// utils/wompi.ts
export async function openWompiCheckout(opts: {
  amountInCents: number;
  referenceBase: string; // se le agrega timestamp
  redirectUrl?: string;
  expirationTimeISO?: string;
  // 👇 NUEVO: datos del pagador
  customerData?: {
    email?: string;
    fullName?: string;          // 👈 camelCase (como la doc)
    phoneNumber?: string;
    phoneNumberPrefix?: string; // +57
    legalId?: string;
    legalIdType?: "CC"|"CE"|"NIT"|"PP"|"TI"|"DNI"|"RG"|"OTHER";
  };
}) {
  const currency = "COP";
  const reference = `${opts.referenceBase}-${Date.now()}`;

  const integrity = await fetch("/api/wompi/integrity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reference,
      amountInCents: opts.amountInCents,
      currency,
      expirationTime: opts.expirationTimeISO,
    }),
  }).then(r => r.json()).then(j => j.integrity);

  // Carga widget si hace falta
  await ensureWompiReady();

  // @ts-ignore
  const checkout = new window.WidgetCheckout({
    currency,
    amountInCents: opts.amountInCents,
    reference,
    publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
    signature: { integrity },
    ...(opts.redirectUrl ? { redirectUrl: opts.redirectUrl } : {}),
    ...(opts.expirationTimeISO ? { expirationTime: opts.expirationTimeISO } : {}),
    ...(opts.customerData ? { customerData: opts.customerData } : {}), // 👈 PASA EL NOMBRE AQUÍ
  });

  // (Opcional pero útil) Pre-registra un evento PENDING con el nombre
  if (opts.customerData?.fullName || opts.customerData?.email) {
    fetch("/api/wompi/prefill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        amount_in_cents: opts.amountInCents,
        currency,
        customer_name: opts.customerData.fullName ?? null,
        customer_email: opts.customerData.email ?? null,
      }),
    }).catch(()=>{});
  }

  checkout.open((result: any) => {
    console.log("Transaction:", result?.transaction);
  });
}

/** cargador del widget */
let wompiReadyPromise: Promise<void> | null = null;
function ensureWompiReady() {
  if (typeof window === "undefined") return Promise.resolve();
  if (wompiReadyPromise) return wompiReadyPromise;
  wompiReadyPromise = new Promise<void>((resolve, reject) => {
    // @ts-ignore
    if (window.WidgetCheckout) return resolve();
    const SRC = "https://checkout.wompi.co/widget.js";
    const s = document.createElement("script");
    s.src = SRC; s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar widget.js"));
    document.head.appendChild(s);
  });
  return wompiReadyPromise;
}
