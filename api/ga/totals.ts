// Vercel serverless (Node). Devuelve { views, users } en una sola llamada.
// Requiere: GA_PROPERTY_ID, GA_CLIENT_EMAIL, GA_PRIVATE_KEY (multilínea o con \n)
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
      metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
    });

    const headers = (report.metricHeaders || []).map(h => h.name);
    const idxViews = headers.indexOf("screenPageViews");
    const idxUsers = headers.indexOf("totalUsers");
    const row = report.rows?.[0]?.metricValues || [];
    const views = Number(row[idxViews]?.value ?? 0);
    const users = Number(row[idxUsers]?.value ?? 0);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json({ views, users });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
