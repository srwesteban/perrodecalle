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
      status?: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | string;
      payment_method_type?: string;
      customer_email?: string;
      payment_method?: {
        type?: string;
        extra?: {
          financialInstitutionCode?: string;
          financial_institution_name?: string;
          bank_code?: string;
          bank_name?: string;
          fullName?: string;
        };
      };
    };
  };
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceRole) {
    return new Response("server misconfigured", { status: 500 });
  }

  try {
    const payload = (await req.json()) as WompiEvent;
    // console.log(JSON.stringify(payload)); // si quieres ver en logs

    const tx = payload?.data?.transaction;
    if (!tx?.reference) return new Response("no reference", { status: 400 });

    const bankName =
      tx?.payment_method?.extra?.financial_institution_name ||
      tx?.payment_method?.extra?.bank_name ||
      null;
    const bankCode =
      tx?.payment_method?.extra?.financialInstitutionCode ||
      tx?.payment_method?.extra?.bank_code ||
      null;

    // === UPSERT por 'reference' (unique constraint) ===
    const r = await fetch(`${supabaseUrl}/rest/v1/donations`, {
      method: "POST",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
        // merge duplicates = upsert por unique constraints (reference)
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        reference: tx.reference,
        amount_in_cents: tx.amount_in_cents ?? null,
        currency: (tx.currency ?? "COP").toUpperCase(),
        status: tx.status ?? "PENDING",
        tx_id: tx.id ?? null,
        provider: "WOMPI",
        payment_method_type: tx.payment_method_type ?? tx?.payment_method?.type ?? null,
        bank_name: bankName,
        bank_code: bankCode,
        customer_email: tx.customer_email ?? null,
        customer_name: tx?.payment_method?.extra?.fullName ?? null,
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
