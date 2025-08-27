export const config = { runtime: "nodejs" };
import crypto from "node:crypto";

// Espera: { reference: string, amountInCents: number, currency: "COP" }
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { reference, amountInCents, currency = "COP" } = req.body ?? {};

    if (!reference || !amountInCents || !currency) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const integrityKey = process.env.WOMPI_INTEGRITY_SECRET;
    if (!integrityKey) {
      return res
        .status(500)
        .json({ error: "Missing env WOMPI_INTEGRITY_SECRET" });
    }

    // Orden exacto requerido por Wompi:
    const base = `${reference}${amountInCents}${currency}${integrityKey}`;
    const signature = crypto.createHash("sha256").update(base).digest("hex");

    return res.status(200).json({ signature });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
