// /api/ga/total-views.ts
export const config = { runtime: "nodejs" };

export default async function handler(req: any, res: any) {
  const { BetaAnalyticsDataClient } = await import("@google-analytics/data");

  const client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA_CLIENT_EMAIL,
      // Por si tu clave en Vercel tiene \n escapados:
      private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
  });

  try {
    // Todo el tiempo (desde que existe la propiedad)
    const [report] = await client.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate: "2000-01-01", endDate: "today" }],
      metrics: [{ name: "screenPageViews" }], // total de vistas
    });

    const totalViews = Number(report.rows?.[0]?.metricValues?.[0]?.value ?? 0);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json({ totalViews });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "GA error" });
  }
}
