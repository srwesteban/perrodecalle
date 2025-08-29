// /api/wompi/integrity.ts
export const config = { runtime: "nodejs" };
import crypto from "node:crypto";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");
  try {
    const {
      reference,
      amountInCents,
      currency = "COP",
      expirationTime, // ISO8601 opcional
    } = req.body ?? {};

    if (!reference || !amountInCents) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Soporta ambos nombres por si tu .env usa el viejo
    const integrityKey =
      process.env.WOMPI_INTEGRITY_SECRET ?? process.env.WOMPI_INTEGRITY;

    if (!integrityKey) {
      return res.status(500).json({ error: "Missing WOMPI_INTEGRITY_SECRET env" });
    }

    const ref = String(reference);
    const amt = String(amountInCents); // en centavos
    const cur = String(currency).toUpperCase();

    const base = expirationTime
      ? `${ref}${amt}${cur}${expirationTime}${integrityKey}`
      : `${ref}${amt}${cur}${integrityKey}`;

    const integrity = crypto.createHash("sha256").update(base).digest("hex");
    res.status(200).json({ integrity });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
}