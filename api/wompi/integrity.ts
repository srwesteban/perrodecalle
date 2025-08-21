export const config = { runtime: "edge" };

function hex(buffer: ArrayBuffer) {
  const view = new Uint8Array(buffer);
  return [...view].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const { reference, amountInCents, currency = "COP", expiration } = await req.json();

  const secret = process.env.WOMPI_INTEGRITY_SECRET || "";
  if (!secret) return new Response("Missing WOMPI_INTEGRITY_SECRET", { status: 500 });

  const base = `${reference}${amountInCents}${currency}${expiration ?? ""}${secret}`;
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(base));

  return new Response(JSON.stringify({ signature: hex(hash) }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
