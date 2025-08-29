// /api/wompi/webhook.ts
export const config = { runtime: "edge" };

type WompiEvent = {
  event?: string;
  data?: {
    transaction?: {
      id?: string;
      reference?: string;
      amountInCents?: number;
      currency?: string;
      status?: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";

      // 👇 extras
      paymentMethodType?: string; // "CARD" | "PSE" | "NEQUI"
      paymentMethod?: {
        type?: string;
        extra?: {
          financial_institution?: string;
        };
      };

      customerData?: {
        fullName?: string;
        email?: string;
        phoneNumber?: string;
        phoneNumberPrefix?: string;
        legalId?: string;
        legalIdType?: string;
      };

      shippingAddress?: {
        addressLine1?: string;
        city?: string;
        region?: string;
        country?: string;
        phoneNumber?: string;
        name?: string;
      };

      taxInCents?: {
        vat?: number;
        consumption?: number;
      };

      paymentDescription?: string;
      cus?: string;
    };
  };
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405 });

  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceRole)
    return new Response("server misconfigured", { status: 500 });

  try {
    const payload = (await req.json()) as WompiEvent;
    const tx = payload?.data?.transaction;
    if (!tx?.reference) return new Response("no reference", { status: 400 });

    // UPSERT en donations (último estado)
    const r1 = await fetch(`${supabaseUrl}/rest/v1/donations`, {
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
        amount_in_cents: tx.amountInCents,
        currency: tx.currency ?? "COP",
        provider: "wompi",

        // extras
        payment_method: tx.paymentMethodType,
        bank: tx.paymentMethod?.extra?.financial_institution,
        customer_name: tx.customerData?.fullName,
        customer_email: tx.customerData?.email,
        cus: tx.cus,
        description: tx.paymentDescription,
      }),
    });

    if (!r1.ok) {
      console.error("Supabase UPSERT error:", await r1.text());
      return new Response("db error", { status: 500 });
    }

    // INSERT en donation_events (historial)
    const r2 = await fetch(`${supabaseUrl}/rest/v1/donation_events`, {
      method: "POST",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reference: tx.reference,
        tx_id: tx.id,
        status: tx.status,
        amount_in_cents: tx.amountInCents, // 👈 camelCase según la doc
        currency: tx.currency ?? "COP",
        provider: "wompi",
      }),
    });

    if (!r2.ok) {
      console.error("Supabase event insert error:", await r2.text());
      return new Response("db error (event)", { status: 500 });
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("webhook error:", e);
    return new Response("invalid", { status: 400 });
  }
}
