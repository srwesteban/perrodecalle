// /api/bold/webhook.ts

export const config = {
  runtime: "nodejs",
};

type BoldEvent = {
  type?: string;
  subject?: string;
  data?: {
    payment_id?: string;
    amount?: { total?: number | null } | null;
    metadata?: { reference?: string | null } | null;
  };
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
    const payload = req.body as BoldEvent;

    // 1) Mapear tipo de evento de Bold -> nuestro estado
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

    // 2) Normalizar monto: Bold (COP) suele enviar "total" en pesos
    const rawTotal = payload?.data?.amount?.total ?? null;
    const toCentsCOP = (v: number | null) => {
      if (v == null) return null;
      // si parece venir en pesos (valor pequeño), llévalo a centavos
      if (v > 0 && v < 5_000_000) return v * 100; // 1.000 -> 100.000
      return v; // por si algún día ya viene en centavos
    };
    const amount_in_cents = toCentsCOP(rawTotal);

    const reference =
      payload?.data?.metadata?.reference?.toString() ?? null;
    const currency = "COP";
    const tx_id =
      payload?.data?.payment_id?.toString() ??
      payload?.subject?.toString() ??
      null;

    // 3) Guardar evento crudo para auditoría
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

    // 4) Upsert en donations (clave: reference)
    if (reference) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/donations?on_conflict=reference`,
        {
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
        }
      );
    }

    res.statusCode = 200;
    res.end("ok");
  } catch (e: any) {
    console.error("bold webhook error:", e?.message || e);
    res.statusCode = 400;
    res.end("invalid");
  }
}
