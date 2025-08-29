// /api/wompi/webhook.ts  (Vercel Node Function)
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

// ---- utils ----
async function readJSON(req: any) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const raw = await new Promise<string>((resolve, reject) => {
    let data = "";
    req.on("data", (c: Buffer) => (data += c));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
  return raw ? JSON.parse(raw) : {};
}
function sha256(s: string) {
  return createHash("sha256").update(s, "utf8").digest("hex");
}
function getByPath(o: any, p: string) {
  return p.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
}
function sb() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405; res.setHeader("Allow", "POST");
      return res.end("Method Not Allowed"); // ← no abras esto en el navegador
    }

    const EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET;
    if (!EVENTS_SECRET) { res.statusCode = 500; return res.end("Missing WOMPI_EVENTS_SECRET"); }

    const body = await readJSON(req);
    console.log("WEBHOOK RECIBIDO:", JSON.stringify(body)); // ← verás esto en Vercel Logs

    // ---- validar firma (Wompi) ----
    const sig = body?.signature || {};
    const props: string[] = sig.properties ?? [];
    const ts = sig.timestamp;
    const values = props.map((p) => String(getByPath(body?.data ?? {}, p) ?? ""));
    const expected = sha256(values.join("") + String(ts) + EVENTS_SECRET);
    const provided = String(sig.checksum ?? "").toLowerCase();
    const header = String(req.headers["x-event-checksum"] ?? "").toLowerCase();
    const valid = provided === expected || header === expected;

    const tx = body?.data?.transaction ?? {};
    const reference: string | null = tx.reference ?? null;

    // ---- guarda SIEMPRE el evento bruto (marca si la firma fue válida) ----
    const supabase = sb();
    await supabase.from("donation_events").insert({
      source: "WOMPI",
      event: String(body?.event ?? "unknown"),
      signature_checksum: provided || header || null,
      signature_timestamp: ts ?? null,
      tx_id: tx.id ?? null,
      reference,
      status: tx.status ?? null,
      payment_method_type: tx.payment_method_type ?? tx?.payment_method?.type ?? null,
      bank_name:
        tx?.payment_method?.extra?.financial_institution_name ??
        tx?.payment_method?.extra?.bank_name ??
        null,
      bank_code:
        tx?.payment_method?.extra?.financialInstitutionCode ??
        tx?.payment_method?.extra?.bank_code ??
        null,
      customer_email: tx.customer_email ?? tx?.customerData?.email ?? null,
      payload: body,
    });

    // ---- solo si la firma es válida, reflejamos en donations ----
    if (valid && reference) {
      const row: any = {
        reference,
        amount_in_cents: tx.amount_in_cents ?? null,
        currency: tx.currency ?? "COP",
        status: tx.status ?? "PENDING",
        tx_id: tx.id ?? null,
        provider: "WOMPI",
        payment_method_type: tx.payment_method_type ?? tx?.payment_method?.type ?? null,
        bank_name:
          tx?.payment_method?.extra?.financial_institution_name ??
          tx?.payment_method?.extra?.bank_name ??
          null,
        bank_code:
          tx?.payment_method?.extra?.financialInstitutionCode ??
          tx?.payment_method?.extra?.bank_code ??
          null,
        customer_email: tx.customer_email ?? null,
        customer_name: tx?.payment_method?.extra?.fullName ?? null,
      };
      await supabase.from("donations").upsert(row, { onConflict: "reference" });
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ ok: true, validSignature: valid }));
  } catch (e: any) {
    console.error("WEBHOOK ERROR:", e?.message || e);
    res.statusCode = 200; // evitar reintentos infinitos
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ ok: false, error: e?.message || "error" }));
  }
}
