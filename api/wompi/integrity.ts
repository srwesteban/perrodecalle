// /api/wompi/integrity.ts
import { createHash } from "crypto";

// Util para leer JSON en Vercel Node Functions
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

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Allow", "POST");
      return res.end("Method Not Allowed");
    }

    const INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET;
    if (!INTEGRITY_SECRET) {
      res.statusCode = 500;
      return res.end("Missing WOMPI_INTEGRITY_SECRET");
    }

    const { reference, amountInCents, currency, expirationTime } = await readJSON(req);

    if (!reference || !amountInCents || !currency) {
      res.statusCode = 400;
      return res.end("reference, amountInCents, currency son obligatorios");
    }

    const base = `${reference}${amountInCents}${currency}${expirationTime ? expirationTime : ""}${INTEGRITY_SECRET}`;
    const integrity = createHash("sha256").update(base, "utf8").digest("hex");

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ integrity }));
  } catch (err: any) {
    res.statusCode = 500;
    return res.end(err?.message ?? "Internal error");
  }
}