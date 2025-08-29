// /api/wompi/webhook.ts
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

  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceRole) return new Response("server misconfigured", { status: 500 });

  try {
    const payload = (await req.json()) as WompiEvent;
    const tx = payload?.data?.transaction;
    if (!tx?.reference) return new Response("no reference", { status: 400 });

    // (opcional) validar firma del webhook con WOMPI_EVENTS_SECRET aquí

    // UPSERT por 'reference'
    const r = await fetch(`${supabaseUrl}/rest/v1/donations`, {
      method: "POST",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        reference: tx.reference,
        status: tx.status,
        tx_id: tx.id,
        amount_in_cents: tx.amount_in_cents,
        currency: tx.currency ?? "COP",
        provider: "wompi", // quítalo si no existe la columna
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      console.error("Supabase UPSERT error:", t);
      return new Response("db error", { status: 500 });
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("webhook error:", e);
    return new Response("invalid", { status: 400 });
  }
}