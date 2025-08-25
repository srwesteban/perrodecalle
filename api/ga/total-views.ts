// /api/ga/total-views.ts
export const config = { runtime: "nodejs" };

export default async function handler(req: any, res: any) {
  const { BetaAnalyticsDataClient } = await import("@google-analytics/data");

  const client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA_CLIENT_EMAIL,
      // si pegaste la clave con \n, esto la reconstituye
      private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
  });

  try {
    // 1) Total histórico con screenPageViews (sin dimensiones = total)
    const result1 = await client.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate: "2000-01-01", endDate: "today" }],
      metrics: [{ name: "screenPageViews" }],
    });
    const report1 = result1[0];
    let total =
      Number(report1.rows?.[0]?.metricValues?.[0]?.value ?? 0);

    // 2) Fallback si sigue en 0: contar eventos page_view
    if (!total) {
      const result2 = await client.runReport({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        dateRanges: [{ startDate: "2000-01-01", endDate: "today" }],
        metrics: [{ name: "eventCount" }],
        dimensions: [{ name: "eventName" }],
        // sin enums: EXACT es el default, no hace falta declararlo
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            stringFilter: { value: "page_view" },
          },
        },
      });
      const report2 = result2[0];
      total = Number(report2.rows?.[0]?.metricValues?.[0]?.value ?? 0);
    }

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json({ totalViews: total });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "GA error" });
  }
}
