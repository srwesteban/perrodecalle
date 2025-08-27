// /api/wompi/webhook.ts
export const config = { runtime: "nodejs" };
import crypto from "node:crypto";

async function readRawReq(req: any): Promise<string> {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw;
}

function constantTimeEqual(a: string, b: string): boolean {
  const A = Buffer.from(a, "hex");
  const B = Buffer.from(b, "hex");
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const raw = await readRawReq(req);
    const secret = process.env.WOMPI_EVENTS_SECRET;
    if (!secret) return res.status(500).json({ error: "Missing WOMPI_EVENTS_SECRET" });

    const headerRaw =
      (req.headers["x-event-signature"] as string) ||
      (req.headers["x-signature"] as string) ||
      "";

    // Wompi suele enviar "sha256=<hex>" o solo "<hex>"
    const received = headerRaw.startsWith("sha256=") ? headerRaw.slice(7) : headerRaw;

    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");

    const valid = constantTimeEqual(expected, received);
    if (!valid) {
      console.warn("[wompi:webhook] invalid signature", { receivedPreview: received.slice(0, 10) });
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(raw); // ya validado
    console.log("[wompi:webhook] valid event", {
      type: event?.event ?? event?.type ?? "unknown",
      transactionId: event?.data?.transaction?.id,
      status: event?.data?.transaction?.status,
    });

    // TODO: aquí persiste el evento/actualiza tu DB según el status final (APPROVED/DECLINED/VOIDED)
    // ...

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[wompi:webhook] error:", e);
    return res.status(500).json({ error: "server error" });
  }
}
