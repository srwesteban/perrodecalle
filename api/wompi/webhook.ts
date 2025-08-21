export const config = { runtime: "edge" };

type WompiEvent = {
  event?: string;
  data?: {
    transaction?: {
      id?: string;
      reference?: string;
      amount_in_cents?: number;
      currency?: string;
      status?: "PENDING"|"APPROVED"|"DECLINED"|"VOIDED"|"ERROR";
    };
  };
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return new Response("server misconfigured", { status: 500 });
  }

  try {
    const payload = (await req.json()) as WompiEvent;
    const tx = payload?.data?.transaction;
    if (!tx?.reference) return new Response("no reference", { status: 400 });

    // TODO: (opcional) validar firma del evento con WOMPI_EVENTS_SECRET

    const res = await fetch(`${supabaseUrl}/rest/v1/donations?reference=eq.${encodeURIComponent(tx.reference)}`, {
      method: "PATCH",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status: tx.status,
        tx_id: tx.id,
        amount_in_cents: tx.amount_in_cents,
        currency: tx.currency,
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("Supabase PATCH error:", t);
      return new Response("db error", { status: 500 });
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("webhook error:", e);
    return new Response("invalid", { status: 400 });
  }
}
