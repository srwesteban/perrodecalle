export const config = {
  runtime: "nodejs",
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method not allowed");
    return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SRV = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  try {
    const payload = req.body;

    // Mapear tipo de evento
    let status: string | null = null;
    switch (payload?.type) {
      case "SALE_APPROVED":
        status = "APPROVED";
        break;
      case "SALE_REJECTED":
        status = "DECLINED";
        break;
      case "VOID_APPROVED":
        status = "VOIDED";
        break;
      case "VOID_REJECTED":
        status = "DECLINED";
        break;
      default:
        status = payload?.type || "PENDING";
    }

    const reference = payload?.data?.metadata?.reference ?? null;
    const amount_in_cents = payload?.data?.amount?.total ?? null;
    const currency = "COP";
    const tx_id = payload?.data?.payment_id ?? payload?.subject ?? null;

    // Insertar evento crudo para depurar
    await fetch(`${SUPABASE_URL}/rest/v1/bold_events`, {
      method: "POST",
      headers: {
        apikey: SRV,
        Authorization: `Bearer ${SRV}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        reference,
        status,
        amount_in_cents,
        currency,
        tx_id,
        raw: payload,
        source: "bold",
      }),
    });

    // Upsert en donations
    if (reference) {
      await fetch(`${SUPABASE_URL}/rest/v1/donations?on_conflict=reference`, {
        method: "POST",
        headers: {
          apikey: SRV,
          Authorization: `Bearer ${SRV}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
          reference,
          status,
          amount_in_cents,
          currency,
          tx_id,
          provider: "bold",
          updated_at: new Date().toISOString(),
        }),
      });
    }

    res.statusCode = 200;
    res.end("ok");
  } catch (e: any) {
    console.error("bold webhook error:", e?.message || e);
    res.statusCode = 400;
    res.end("invalid");
  }
}
