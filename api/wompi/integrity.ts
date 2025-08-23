// /api/wompi/integrity.ts
export const config = { runtime: "nodejs" };
import crypto from "node:crypto";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");
  try {
    const { reference, amountInCents, currency = "COP" } = req.body ?? {};
    if (!reference || !amountInCents) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const integrityKey = process.env.WOMPI_INTEGRITY_SECRET!;
    const integrity = crypto
      .createHash("sha256")
      .update(`${reference}${amountInCents}${currency}${integrityKey}`)
      .digest("hex");

    res.status(200).json({ integrity });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
}
