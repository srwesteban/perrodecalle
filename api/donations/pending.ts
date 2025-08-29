// /api/donations/pending.ts
export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  
  try {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !serviceRole) {
      return new Response("Missing Supabase env vars", { status: 500 });
    }

    const body = await req.json();

    if (!body?.reference || !body?.amount_in_cents) {
      return new Response("Missing reference or amount_in_cents", { status: 400 });
    }

    const r = await fetch(`${supabaseUrl}/rest/v1/donations`, {
      method: "POST",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
        // si hay unique index en reference, esto evita duplicados
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        provider: body.provider ?? "wompi",
        reference: body.reference,
        amount_in_cents: body.amount_in_cents,
        currency: (body.currency ?? "COP").toUpperCase(),
        status: "PENDING",
      }),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      return new Response(`db error: ${txt}`, { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(`server error: ${e?.message ?? "unknown"}`, { status: 500 });
  }
}
