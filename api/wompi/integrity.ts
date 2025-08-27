// /api/wompi/integrity.ts
export const config = { runtime: "edge" };

function toHex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,"0")).join("");
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { reference, amountInCents, currency, expirationTime } = await req.json() as {
      reference?: string;
      amountInCents?: number;
      currency?: string;
      expirationTime?: string; // ISO opcional
    };

    if (!reference || !amountInCents || !currency) {
      return new Response(JSON.stringify({ error: "missing params" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    const secret = process.env.WOMPI_INTEGRITY || process.env.WOMPI_INTEGRITY_SECRET;
    if (!secret) {
      return new Response(JSON.stringify({ error: "Integrity secret misconfigured" }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    // Cadena EXACTA según Wompi:
    // "<reference><amountInCents><currency>[<expirationTime>]<secret>"
    const chain = expirationTime
      ? `${reference}${amountInCents}${currency}${expirationTime}${secret}`
      : `${reference}${amountInCents}${currency}${secret}`;

    const enc = new TextEncoder().encode(chain);
    const hashBuf = await crypto.subtle.digest("SHA-256", enc);
    const integrity = toHex(hashBuf);

    return new Response(JSON.stringify({ integrity }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "internal" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
}
