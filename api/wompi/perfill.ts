// /api/wompi/prefill.ts
export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceRole) return new Response("server misconfigured", { status: 500 });

  try {
    const { reference, amount_in_cents, currency = "COP", customer_name = null, customer_email = null } =
      await req.json();

    // upsert en donations (crea PENDING si no existe)
    await fetch(`${supabaseUrl}/rest/v1/donations`, {
      method: "POST",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        reference,
        status: "PENDING",
        amount_in_cents,
        currency,
        provider: "wompi",
        customer_name,
        customer_email,
      }),
    });

    // evento PENDING con nombre
    await fetch(`${supabaseUrl}/rest/v1/donation_events`, {
      method: "POST",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reference,
        status: "PENDING",
        amount_in_cents,
        currency,
        provider: "wompi",
        customer_name,
        customer_email,
      }),
    });

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("invalid", { status: 400 });
  }
}

