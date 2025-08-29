let wompiReadyPromise: Promise<void> | null = null;

export function ensureWompiReady(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (wompiReadyPromise) return wompiReadyPromise;

  wompiReadyPromise = new Promise<void>((resolve, reject) => {
    // @ts-ignore
    if (window.WidgetCheckout) return resolve();

    const SRC = 'https://checkout.wompi.co/widget.js';
    let script = document.querySelector(`script[src="${SRC}"]`) as HTMLScriptElement | null;

    const iv = window.setInterval(() => {
      // @ts-ignore
      if (window.WidgetCheckout) { window.clearInterval(iv); resolve(); }
    }, 30);

    const done = () => { try { window.clearInterval(iv); } catch {} resolve(); };
    const fail = (err: any) => { try { window.clearInterval(iv); } catch {} reject(err instanceof Error ? err : new Error(String(err))); };

    if (!script) {
      script = document.createElement('script');
      script.src = SRC;
      script.async = true;
      script.onload = done;
      script.onerror = () => fail(new Error('No se pudo cargar widget.js de Wompi'));
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', done, { once: true });
      script.addEventListener('error', () => fail(new Error('Fallo al cargar widget.js')), { once: true });
    }
  });
  return wompiReadyPromise;
}

export async function fetchIntegrity(params: {
  reference: string;
  amountInCents: number;
  currency: string;
  expirationTimeISO?: string;
}) {
  const r = await fetch('/api/wompi/integrity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reference: params.reference,
      amountInCents: params.amountInCents,
      currency: params.currency,
      expirationTime: params.expirationTimeISO
    })
  });
  const json = await r.json();
  if (!json?.integrity) throw new Error('Backend no devolvió integrity');
  return json.integrity as string;
}

export async function openWompiCheckout(opts: {
  amountInCents: number;
  currency?: 'COP';
  referenceBase: string;
  redirectUrl?: string;
  expirationTimeISO?: string;
}) {
  const currency = opts.currency ?? 'COP';
  const reference = `${opts.referenceBase}-${Date.now()}`;
  const integrity = await fetchIntegrity({
    reference,
    amountInCents: opts.amountInCents,
    currency,
    expirationTimeISO: opts.expirationTimeISO
  });

  await ensureWompiReady();
  // @ts-ignore
  const checkout = new window.WidgetCheckout({
    currency,
    amountInCents: opts.amountInCents,
    reference,
    publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
    signature: { integrity },
    ...(opts.redirectUrl ? { redirectUrl: opts.redirectUrl } : {}),
    ...(opts.expirationTimeISO ? { expirationTime: opts.expirationTimeISO } : {})
  });

  checkout.open((result: any) => {
    console.log('Transaction:', result?.transaction);
  });
}
