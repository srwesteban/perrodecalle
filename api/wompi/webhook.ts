export const config = { runtime: "edge" };

type WompiEvent = {
  event?: string;
  timestamp?: string | number;
  signature?: { properties?: string[]; checksum?: string };
  data?: any;
};

function getProp(obj: any, path: string) {
  return path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}
async function sha256Hex(str: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("method_not_allowed", { status: 405 });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
  if (!supabaseUrl || !serviceRole || !eventsSecret) return new Response("server_misconfigured", { status: 500 });

  try {
    const raw = await req.text();
    const body = JSON.parse(raw) as WompiEvent;

    const provided = (req.headers.get("x-event-checksum") || body?.signature?.checksum || "").toUpperCase();
    const props = body?.signature?.properties ?? [];
    const concatProps = props.map(p => String(getProp(body?.data, p) ?? "")).join("");
    const timestamp = String(body?.timestamp ?? "");
    const computed = await sha256Hex(concatProps + timestamp + eventsSecret);
    if (!provided || computed !== provided) return new Response("bad_signature", { status: 401 });

    if (body?.event !== "transaction.updated") return new Response("ignored", { status: 200 });

    const tx = body?.data?.transaction as {
      id?: string; reference?: string; amount_in_cents?: number; currency?: string;
      status?: "PENDING"|"APPROVED"|"DECLINED"|"VOIDED"|"ERROR";
    };
    if (!tx?.reference) return new Response("no_reference", { status: 400 });

    const payload = {
      reference: tx.reference,
      status: tx.status,
      tx_id: tx.id,
      amount_in_cents: tx.amount_in_cents,
      currency: tx.currency ?? "COP",
      provider: "wompi",
    };

    const r = await fetch(`${supabaseUrl}/rest/v1/donations?on_conflict=reference`, {
      method: "POST",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) return new Response("db_error", { status: 500 });

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("webhook error:", e);
    return new Response("invalid", { status: 400 });
  }
}
