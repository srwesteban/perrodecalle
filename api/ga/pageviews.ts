// /api/ga/pageviews.ts
export const config = { runtime: "nodejs" };
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: process.env.GA_PRIVATE_KEY,
  },
});

export default async function handler(req: any, res: any) {
  try {
    const range = String(req.query.range || "");
    const start = String(req.query.start || ""); // YYYY-MM-DD
    const end = String(req.query.end || "today");
    const days = Number(req.query.days ?? 28);

    const dateRanges =
      range === "all"
        ? [{ startDate: "2000-01-01", endDate: "today" }] // desde siempre (la propiedad solo tendrá datos desde que existe)
        : start
        ? [{ startDate: start, endDate: end || "today" }]
        : [{ startDate: `${days}daysAgo`, endDate: "today" }];

    const [report] = await client.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges,
      dimensions: [{ name: "pageTitle" }, { name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 1000,
    });

    const rows = (report.rows ?? []).map((r) => ({
      title: r.dimensionValues?.[0]?.value ?? "(sin título)",
      path: r.dimensionValues?.[1]?.value ?? "/",
      views: Number(r.metricValues?.[0]?.value ?? 0),
      users: Number(r.metricValues?.[1]?.value ?? 0),
    }));

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json({ rows });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "GA error" });
  }
}
