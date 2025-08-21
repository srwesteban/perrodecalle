// api/wompi/webhook.ts
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

  try {
    const payload = (await req.json()) as WompiEvent;
    const tx = payload?.data?.transaction;
    if (!tx?.reference) return new Response("no reference", { status: 400 });

    // (Opcional) valida firma del evento con tu EVENTS_SECRET aquí

    const url = `${process.env.SUPABASE_URL}/rest/v1/donations?reference=eq.${encodeURIComponent(
      tx.reference
    )}`;

    const body = JSON.stringify({
      status: tx.status,
      tx_id: tx.id,
      amount_in_cents: tx.amount_in_cents,
      currency: tx.currency,
    });

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body,
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("Supabase PATCH error:", t);
      return new Response("db error", { status: 500 });
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("invalid", { status: 400 });
  }
}
