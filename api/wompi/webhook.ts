// /api/wompi/webhook.ts
export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceRole) return new Response("server misconfigured", { status: 500 });

  try {
    const event = await req.json();
    // Estructura típica: event.data.transaction
    const tx = event?.data?.transaction ?? null;

    // si no hay transacción o NO está aprobada, no dispares nada
    if (!tx || tx.status !== "APPROVED") return new Response("ok", { status: 200 });

    const body = {
      donation_id: null,
      reference: tx.reference ?? null,
      tx_id: tx.id ?? null,
      status: "APPROVED",
      amount_in_cents: Number(tx.amount_in_cents ?? 0) || null,
      currency: tx.currency ?? "COP",
      provider: "WOMPI",

      // opcionales (si vienen)
      customer_full_name: tx.customer_data?.full_name ?? null,
      customer_email: tx.customer_data?.email ?? null,
      customer_phone: tx.customer_data?.phone_number ?? null,
      customer_phone_prefix: tx.customer_data?.phone_number_prefix ?? null,
      customer_legal_id: tx.customer_data?.legal_id ?? null,
      customer_legal_id_type: tx.customer_data?.legal_id_type ?? null,

      shipping_address_line1: tx.shipping_address?.address_line_1 ?? null,
      shipping_city: tx.shipping_address?.city ?? null,
      shipping_region: tx.shipping_address?.region ?? null,
      shipping_country: tx.shipping_address?.country ?? null,
      shipping_phone: tx.shipping_address?.phone_number ?? null,

      wompi_created_at: tx.created_at ?? null,
      wompi_finalized_at: tx.finalized_at ?? null,
      wompi_payload: event ?? null,
    };

    await fetch(`${supabaseUrl}/rest/v1/donation_events`, {
      method: "POST",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });

    // (opcional) sincroniza tabla principal
    await fetch(`${supabaseUrl}/rest/v1/donations?reference=eq.${encodeURIComponent(body.reference ?? "")}`, {
      method: "PATCH",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "APPROVED",
        amount_in_cents: body.amount_in_cents,
        currency: body.currency,
        tx_id: body.tx_id,
      }),
    });

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("[webhook] error", e);
    // siempre 200 para que Wompi no reintente infinito
    return new Response("ok", { status: 200 });
  }
}
