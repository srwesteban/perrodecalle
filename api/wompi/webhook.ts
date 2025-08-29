// /api/wompi/webhook.ts
export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceRole) return new Response("server misconfigured", { status: 500 });

  try {
    const event = await req.json();
    const tx = event?.data?.transaction ?? null;

    // Puedes decidir procesar PENDING/DECLINED también.
    if (!tx) return new Response("ok", { status: 200 });

    const payment_method_type = tx.payment_method_type ?? tx.payment_method?.type ?? null;
    const payment_method_json = tx.payment_method ?? null;

    const body = {
      reference: tx.reference ?? null,
      tx_id: tx.id ?? null,
      status: tx.status ?? "PENDING",
      amount_in_cents: Number(tx.amount_in_cents ?? 0) || null,
      currency: tx.currency ?? "COP",
      provider: "WOMPI",

      customer_full_name: tx.customer_data?.full_name ?? null,
      customer_email: tx.customer_email ?? tx.customer_data?.email ?? null,
      customer_phone: tx.payment_method?.phone_number ?? tx.customer_data?.phone_number ?? null,

      payment_method_type,
      payment_method: payment_method_json,

      wompi_created_at: tx.created_at ?? null,
      wompi_finalized_at: tx.finalized_at ?? null,
    };

    // UPSERT por referencia
    await fetch(`${supabaseUrl}/rest/v1/donations?on_conflict=reference`, {
      method: "POST",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(body),
    });

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("[webhook] error", e);
    return new Response("ok", { status: 200 }); // que Wompi no reintente infinito
  }
}
