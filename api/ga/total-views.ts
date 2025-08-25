// /api/ga/total-views.ts
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

    const dateRanges = [{ startDate: "2015-08-14", endDate: "today" }];

    // 1) pageviews totales
    const r1 = await client.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges,
      metrics: [{ name: "screenPageViews" }],
    });
    let total = Number(r1[0]?.rows?.[0]?.metricValues?.[0]?.value ?? 0);

    // 2) fallback por si screenPageViews viene 0: contar eventos page_view
    if (!total) {
      const r2 = await client.runReport({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        dateRanges,
        metrics: [{ name: "eventCount" }],
        dimensions: [{ name: "eventName" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            stringFilter: { value: "page_view" }, // EXACT por defecto
          },
        },
      });
      total = Number(r2[0]?.rows?.[0]?.metricValues?.[0]?.value ?? 0);
    }

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json({ totalViews: total });
  } catch (e: any) {
    console.error("GA total-views error:", e);
    res.status(500).json({ error: String(e?.message || e) });
  }
}
