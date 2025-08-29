// /api/wompi/prefill.ts
export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceRole) return new Response("server misconfigured", { status: 500 });

  try {
    const {
      reference,
      amount_in_cents,
      currency = "COP",
      customer_full_name = null,
      customer_email = null,
      customer_phone = null,
    } = await req.json();

    // UPSERT por reference
    await fetch(`${supabaseUrl}/rest/v1/donations?on_conflict=reference`, {
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
        provider: "WOMPI",
        customer_full_name,
        customer_email,
        customer_phone,
      }),
    });

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("invalid", { status: 400 });
  }
}
