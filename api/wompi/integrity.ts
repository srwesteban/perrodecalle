// /api/wompi/integrity.ts
import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const { reference, amountInCents, currency, expirationTime } = req.body || {};
  if (!reference || !amountInCents || !currency) {
    return res.status(400).json({ error: 'Faltan reference, amountInCents, currency' });
  }

  const secret = process.env.WOMPI_INTEGRITY_SECRET!;
  const base = `${reference}${amountInCents}${currency}${expirationTime ? expirationTime : ''}${secret}`;
  const integrity = crypto.createHash('sha256').update(base, 'utf8').digest('hex');

  return res.json({ integrity });
}
