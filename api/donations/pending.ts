// /api/donations/pending.ts
export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const body = await req.json();

  const r = await fetch(`${supabaseUrl}/rest/v1/donations`, {
    method: "POST",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      provider: body.provider, // "wompi"
      reference: body.reference,
      amount_in_cents: body.amount_in_cents,
      currency: body.currency ?? "COP",
      status: "PENDING",
    }),
  });

  if (!r.ok) return new Response("db error", { status: 500 });
  return new Response("ok", { status: 200 });
}
