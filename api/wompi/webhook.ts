// /api/wompi/webhook.ts
export const config = { runtime: "nodejs" }; // usa "edge" si así lo tienes y te funciona

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceRole) return res.status(500).send("server misconfigured");

  try {
    const event = req.body ?? (await getBody(req)); // por si Vercel no parsea
    // Estructura típica: event.data.transaction
    const tx = event?.data?.transaction ?? event?.transaction ?? null;

    if (!tx) {
      console.warn("[wompi-webhook] payload sin transaction", event);
      return res.status(200).send("ok");
    }

    // Campos base
    const reference = tx.reference ?? event?.data?.reference ?? null;
    const status    = tx.status ?? "PENDING";
    const amount    = Number(tx.amount_in_cents ?? tx.amountInCents ?? 0);
    const currency  = tx.currency ?? "COP";
    const tx_id     = tx.id ?? null;
    const provider  = "WOMPI";

    // customerData (cuando lo solicitas en el Widget/Web)
    const cd = tx.customer_data ?? tx.customerData ?? {};
    const customer_full_name     = cd.full_name ?? cd.fullName ?? null;
    const customer_email         = cd.email ?? null;
    const customer_phone         = cd.phone_number ?? cd.phoneNumber ?? null;
    const customer_phone_prefix  = cd.phone_number_prefix ?? cd.phoneNumberPrefix ?? null;
    const customer_legal_id      = cd.legal_id ?? cd.legalId ?? null;
    const customer_legal_id_type = cd.legal_id_type ?? cd.legalIdType ?? null;

    // shippingAddress (si lo usas)
    const sa = tx.shipping_address ?? tx.shippingAddress ?? {};
    const shipping_address_line1 = sa.address_line_1 ?? sa.addressLine1 ?? null;
    const shipping_city          = sa.city ?? null;
    const shipping_region        = sa.region ?? null;
    const shipping_country       = sa.country ?? null;
    const shipping_phone         = sa.phone_number ?? sa.phoneNumber ?? null;

    // Fechas Wompi
    const wompi_created_at   = tx.created_at ?? tx.createdAt ?? null;
    const wompi_finalized_at = tx.finalized_at ?? tx.finalizedAt ?? null;

    // Guarda un evento (append) con TODO lo importante
    const body = {
      donation_id: null,                  // si no lo manejas, déjalo null
      reference,
      tx_id,
      status,
      amount_in_cents: isFinite(amount) ? amount : null,
      currency,
      provider,
      customer_full_name,
      customer_email,
      customer_phone,
      customer_phone_prefix,
      customer_legal_id,
      customer_legal_id_type,
      shipping_address_line1,
      shipping_city,
      shipping_region,
      shipping_country,
      shipping_phone,
      wompi_created_at,
      wompi_finalized_at,
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

    // (opcional) también puedes actualizar la fila “donations” por reference si quieres reflejar el último estado
    // await fetch(`${supabaseUrl}/rest/v1/donations?reference=eq.${encodeURIComponent(reference)}`, {
    //   method: "PATCH",
    //   headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}`, "Content-Type": "application/json" },
    //   body: JSON.stringify({ status, amount_in_cents: body.amount_in_cents, currency, tx_id }),
    // });

    res.status(200).send("ok");
  } catch (err) {
    console.error("[wompi-webhook] error", err);
    res.status(200).send("ok"); // responde 200 siempre para no reintentos infinitos
  }
}

// util: lee body si no lo parsea el framework
function getBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: any) => (data += chunk));
    req.on("end", () => {
      try { resolve(JSON.parse(data || "{}")); } catch (e) { resolve({}); }
    });
    req.on("error", reject);
  });
}
