// /api/wompi/webhook.ts
import type { IncomingMessage, ServerResponse } from "http";
import crypto from "node:crypto";

// Node runtime y sin body parser para leer raw
export const config = {
  runtime: "nodejs",
  api: { bodyParser: false },
};

function readRawReq(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function constantTimeEqualHex(expectedHex: string, receivedHex: string): boolean {
  const A = Buffer.from(expectedHex, "hex");
  const B = Buffer.from(receivedHex, "hex");
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method not allowed");
    return;
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const eventsSecret = process.env.WOMPI_EVENTS_SECRET!;
    if (!supabaseUrl || !serviceRole || !eventsSecret) {
      res.statusCode = 500;
      res.end("Missing env vars");
      return;
    }

    const raw = await readRawReq(req);

    const header =
      (req.headers["x-event-signature"] as string) ||
      (req.headers["x-signature"] as string) ||
      "";
    const received = header.startsWith("sha256=") ? header.slice(7) : header;

    const expected = crypto.createHmac("sha256", eventsSecret).update(raw).digest("hex");
    const valid = constantTimeEqualHex(expected, received);

    if (!valid) {
      console.warn("[wompi:webhook] invalid signature", {
        receivedPreview: received?.slice?.(0, 12),
      });
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Invalid signature" }));
      return;
    }

    const event = JSON.parse(raw);
    const tx = event?.data?.transaction ?? {};
    const status = String(tx?.status ?? "").toUpperCase(); // APPROVED / DECLINED / VOIDED / PENDING...
    const reference: string | null =
      tx?.reference ?? tx?.payment_method?.reference ?? null;
    const amount_in_cents: number | null = tx?.amount_in_cents ?? null;
    const currency = (tx?.currency ?? "COP").toUpperCase();

    console.log("[wompi:webhook] valid event", {
      type: event?.event ?? event?.type ?? "unknown",
      txId: tx?.id,
      status,
      reference,
      amount_in_cents,
      currency,
    });

    if (!reference) {
      // No podemos asociar; respondemos 200 para evitar reintentos infinitos
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true, note: "no reference in payload" }));
      return;
    }

    const headers = {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
    };

    // PATCH por reference (si ya existe PENDING u otro)
    const patchRes = await fetch(
      `${supabaseUrl}/rest/v1/donations?reference=eq.${encodeURIComponent(reference)}`,
      {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify({
          provider: "wompi",
          status,
          amount_in_cents,
          currency,
          updated_at: new Date().toISOString(),
        }),
      }
    );

    if (patchRes.ok) {
      const updated = await patchRes.json().catch(() => null);
      if (Array.isArray(updated) && updated.length > 0) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, updated: true }));
        return;
      }
    }

    // Si no existía, inserta
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/donations`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({
        provider: "wompi",
        reference,
        amount_in_cents,
        currency,
        status,
      }),
    });

    if (!insertRes.ok) {
      const txt = await insertRes.text().catch(() => "");
      console.error("[wompi:webhook] insert failed:", insertRes.status, txt);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "db insert failed" }));
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true, inserted: true }));
  } catch (e: any) {
    console.error("[wompi:webhook] error:", e);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "server error", detail: e?.message }));
  }
}
