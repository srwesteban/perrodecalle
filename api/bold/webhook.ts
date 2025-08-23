// api/bold/webhook.ts
export const config = {
  runtime: "nodejs", // ⚠️ no "edge"
};

function mapStatus(s?: string | null) {
  if (!s) return null;
  const up = String(s).toUpperCase();
  if (["PAID","APPROVED","SUCCEEDED","SUCCESS"].includes(up)) return "APPROVED";
  if (["PENDING","IN_PROCESS","PROCESSING"].includes(up)) return "PENDING";
  if (["DECLINED","FAILED","REJECTED","ERROR"].includes(up)) return "DECLINED";
  if (["VOIDED","CANCELED","CANCELLED"].includes(up)) return "VOIDED";
  return up;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method not allowed");
    return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SRV = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const tx = payload?.transaction ?? payload?.data?.transaction ?? payload;

    const reference =
      tx?.reference ??
      payload?.reference ??
      payload?.order?.reference ??
      payload?.data?.reference ??
      null;

    const amount_in_cents =
      tx?.amount_in_cents ??
      payload?.amount_in_cents ??
      payload?.amount_cents ??
      (typeof payload?.amount === "number" ? Math.round(payload.amount * 100) : null) ??
      (typeof payload?.order?.amount === "number" ? Math.round(payload.order.amount * 100) : null);

    const status = mapStatus(tx?.status ?? payload?.status ?? payload?.state ?? null);
    const currency = tx?.currency ?? payload?.currency ?? "COP";
    const tx_id = tx?.id ?? payload?.id ?? null;

    // 1) Guarda todo el evento en bold_events
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
    }).catch(() => {});

    // 2) Upsert en donations si tenemos reference
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
