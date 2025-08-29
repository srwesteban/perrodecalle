// /api/wompi/webhook.ts


import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

// ---------- helpers ----------
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

function getByPath(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function sha256Hex(str: string) {
  return createHash("sha256").update(str, "utf8").digest("hex");
}

const VALID_STATUS = new Set(["PENDING", "APPROVED", "DECLINED", "VOIDED", "ERROR"]);

function safeStatus(s: any) {
  const up = typeof s === "string" ? s.toUpperCase() : "";
  return VALID_STATUS.has(up) ? up : "PENDING";
}

// ---------- supabase ----------
function sb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Allow", "POST");
      return res.end("Method Not Allowed");
    }

    const EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET;
    if (!EVENTS_SECRET) {
      res.statusCode = 500;
      return res.end("Missing WOMPI_EVENTS_SECRET");
    }

    const body = await readJSON(req);

    // ----- Validación de firma del evento (checksum) -----
    const signature = body?.signature;
    const props: string[] = signature?.properties ?? [];
    const timestamp: number = signature?.timestamp;

    if (!Array.isArray(props) || typeof timestamp !== "number") {
      res.statusCode = 400;
      return res.end("Invalid signature object");
    }

    const values = props.map((p) => String(getByPath(body?.data ?? {}, p) ?? ""));
    const computed = sha256Hex(values.join("") + String(timestamp) + EVENTS_SECRET);
    const provided = String(signature?.checksum ?? "").toLowerCase();
    const headerChecksum = String(req.headers["x-event-checksum"] ?? "").toLowerCase();

    if (!provided || (provided !== computed && headerChecksum !== computed)) {
      res.statusCode = 400;
      return res.end("Bad signature");
    }

    // ----- Extrae datos útiles de la transacción -----
    const tx = body?.data?.transaction ?? {};
    const txId: string | null = tx.id ?? null;
    let reference: string = tx.reference ?? (txId ? `tx-${txId}` : `ref-${Date.now()}`);
    const amount_in_cents: number | null = tx.amount_in_cents ?? null;
    const currency: string = tx.currency ?? "COP";
    const status = safeStatus(tx.status);
    const payment_method_type: string | null = tx.payment_method_type ?? tx?.payment_method?.type ?? null;

    // banca (PSE, transferencias) — intentamos varios caminos comunes
    const bank_name: string | null =
      tx?.payment_method?.extra?.bank_name ??
      tx?.payment_method?.extra?.bank ??
      tx?.payment_method?.bank_name ??
      null;

    const bank_code: string | null =
      tx?.payment_method?.extra?.bank_code ??
      tx?.payment_method?.extra?.financial_institution_code ??
      tx?.payment_method?.bank_code ??
      null;

    const customer_email: string | null = tx.customer_email ?? tx?.customerData?.email ?? null;
    const customer_name: string | null =
      tx?.customer_data?.full_name ?? tx?.payment_method?.name ?? tx?.payment_method?.payer_full_name ?? null;

    // ---------- Guarda SIEMPRE el evento bruto ----------
    const supabase = sb();
    await supabase
      .from("donation_events")
      .upsert(
        [
          {
            source: "WOMPI",
            event: String(body?.event ?? "unknown"),
            signature_checksum: provided || headerChecksum,
            signature_timestamp: timestamp,
            tx_id: txId,
            reference,
            status,
            payment_method_type,
            bank_name,
            bank_code,
            customer_email,
            payload: body,
          },
        ],
        { onConflict: "signature_checksum,signature_timestamp", ignoreDuplicates: false }
      );

    // ---------- Upsert en donations por reference ----------
    // amount_in_cents puede venir null en algunos updates; solo lo tocamos si existe
    const donationRow: any = {
      reference,
      currency,
      status,
      tx_id: txId,
      provider: "WOMPI",
      payment_method_type,
      bank_name,
      bank_code,
      customer_email,
      customer_name,
    };
    if (typeof amount_in_cents === "number") donationRow.amount_in_cents = amount_in_cents;

    await supabase.from("donations").upsert(donationRow, { onConflict: "reference" });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ ok: true }));
  } catch (err: any) {
    // Si algo falla, respondemos 200 para evitar reintentos infinitos si el fallo es de nuestra DB
    console.error("Webhook error:", err);
    try {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.end(JSON.stringify({ ok: true, warn: err?.message ?? "stored with warnings" }));
    } catch {
      return; // último recurso
    }
  }
}