// Vercel Serverless (Node), sin @vercel/node
export const config = { runtime: "nodejs" };

export default async function handler(req: any, res: any) {
  try {
    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
    });

    const [report] = await client.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate: "2015-08-14", endDate: "today" }],
      metrics: [{ name: "totalUsers" }], // usuarios únicos
    });

    const totalUsers = Number(report?.rows?.[0]?.metricValues?.[0]?.value ?? 0);
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json({ totalUsers });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
