// /api/wompi/integrity.ts
export const config = { runtime: "edge" };

// HMAC-SHA256 a hex
async function hmacSha256Hex(key: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // ✅ usa tu nombre real y acepta el alterno también
    const integritySecret =
      process.env.WOMPI_INTEGRITY_SECRET ||
      process.env.WOMPI_INTEGRITY_KEY || // fallback opcional
      "";

    if (!integritySecret) {
      return new Response("Missing WOMPI_INTEGRITY_SECRET (or WOMPI_INTEGRITY_KEY)", { status: 500 });
    }

    const body = await req.json();
    const reference: string = body?.reference;
    const amount_in_cents: number = body?.amount_in_cents;
    const currency: string = (body?.currency ?? "COP").toUpperCase();
    const expirationTimeISO: string | undefined = body?.expirationTimeISO;

    if (!reference || !amount_in_cents || !currency) {
      return new Response("Missing fields: reference, amount_in_cents, currency", { status: 400 });
    }

    // Concatenación estándar de Wompi para integrity
    const base = `${reference}${amount_in_cents}${currency}${expirationTimeISO ?? ""}`;
    const integrity = await hmacSha256Hex(integritySecret, base);

    return new Response(JSON.stringify({ integrity }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(`server error: ${e?.message ?? "unknown"}`, { status: 500 });
  }
}
