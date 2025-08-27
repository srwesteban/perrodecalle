// /api/wompi/webhook.ts
export const config = { runtime: "nodejs" };

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    // Loguea lo esencial (NO imprimas secretos)
    console.log("[wompi:webhook] headers:", {
      'content-type': req.headers['content-type'],
      'x-event-signature': req.headers['x-event-signature'] ?? req.headers['x-signature'],
      'user-agent': req.headers['user-agent'],
    });
    console.log("[wompi:webhook] body:", req.body);

    // TODO: aquí luego verificamos la firma con WOMPI_EVENTS_SECRET
    // y persistimos el evento.

    return res.status(200).json({ ok: true }); // responde 2xx rápido
  } catch (e) {
    console.error("[wompi:webhook] error:", e);
    return res.status(500).json({ error: "server error" });
  }
}
