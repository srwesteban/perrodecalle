// /api/wompi/integrity.ts
export const config = { runtime: "nodejs" };
import crypto from "node:crypto";

type Body = {
  reference: string;
  amountInCents: number;
  currency?: "COP";
  expirationTime?: string; // ISO8601 opcional (UTC)
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { reference, amountInCents, currency = "COP", expirationTime } = (req.body ?? {}) as Body;

    const ref = String(reference ?? "").trim();
    const cur = String(currency ?? "COP").toUpperCase();
    const amount = Number.parseInt(String(amountInCents), 10);

    if (!ref || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Missing/invalid fields" });
    }

    const secret = process.env.WOMPI_INTEGRITY_SECRET;
    if (!secret) return res.status(500).json({ error: "Missing WOMPI_INTEGRITY_SECRET" });

    // Orden EXACTO que exige Wompi
    const base = expirationTime
      ? `${ref}${amount}${cur}${expirationTime}${secret}`
      : `${ref}${amount}${cur}${secret}`;

    const integrity = crypto.createHash("sha256").update(base).digest("hex");

    // Útil para depurar (no imprime secretos)
    console.log("[wompi:integrity] signed", {
      reference: ref,
      amountInCents: amount,
      currency: cur,
      hasExpirationTime: Boolean(expirationTime),
      integrityPreview: integrity.slice(0, 10),
    });

    return res.status(200).json({ integrity });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
