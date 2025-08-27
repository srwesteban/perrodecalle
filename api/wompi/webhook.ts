// /api/wompi/webhook.ts
export const config = { runtime: "edge" };

// Tipos mínimos y helpers
type WompiEvent = {
  event?: string;
  timestamp?: string | number;
  signature?: { properties?: string[]; checksum?: string };
  data?: any; // usamos paths dinámicos desde signature.properties
};

function getProp(obj: any, path: string) {
  return path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}
async function sha256Hex(str: string) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("method_not_allowed", { status: 405 });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
  if (!supabaseUrl || !serviceRole || !eventsSecret)
    return new Response("server_misconfigured", { status: 500 });

  try {
    // 1) Lee el body una sola vez (texto -> json)
    const raw = await req.text();
    const body = JSON.parse(raw) as WompiEvent;

    // 2) Verifica firma (Wompi)
    const provided =
      (req.headers.get("x-event-checksum") || body?.signature?.checksum || "").toUpperCase();
    const props = body?.signature?.properties ?? [];
    const concatProps = props.map(p => String(getProp(body?.data, p) ?? "")).join("");
    const timestamp = String(body?.timestamp ?? "");
    const computed = await sha256Hex(concatProps + timestamp + eventsSecret);

    if (!provided || computed !== provided) {
      // Firma inválida → no procesar
      return new Response("bad_signature", { status: 401 });
    }

    // 3) Procesa sólo transaction.updated
    if (body?.event !== "transaction.updated") {
      return new Response("ignored", { status: 200 });
    }

    const tx = body?.data?.transaction as {
      id?: string;
      reference?: string;
      amount_in_cents?: number;
      currency?: string;
      status?: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
    };

    if (!tx?.reference) return new Response("no_reference", { status: 400 });

    // 4) UPSERT por reference (sin enviar created_at para no reescribirlo)
    const upsert = {
      reference: tx.reference,
      status: tx.status,
      tx_id: tx.id,
      amount_in_cents: tx.amount_in_cents,
      currency: tx.currency ?? "COP",
      provider: "wompi",
      // updated_at lo puede poner un trigger en DB si lo tienes
    };

    // on_conflict=reference requiere UNIQUE(reference)
    const r = await fetch(`${supabaseUrl}/rest/v1/donations?on_conflict=reference`, {
      method: "POST",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(upsert),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error("Supabase upsert error:", txt);
      // 500: Wompi reintentará luego
      return new Response("db_error", { status: 500 });
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("webhook error:", e);
    // 400 para marcar inválido; Wompi podría reintentar
    return new Response("invalid", { status: 400 });
  }
}
