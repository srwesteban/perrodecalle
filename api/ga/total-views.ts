// /api/ga/total-views.ts
export const config = { runtime: "nodejs" };

export default async function handler(req: any, res: any) {
  try {
    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");

    const propertyId = process.env.GA_PROPERTY_ID;
    const clientEmail = process.env.GA_CLIENT_EMAIL;
    const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n");

    const client = new BetaAnalyticsDataClient({
      credentials: { client_email: clientEmail, private_key: privateKey },
    });

    const dateRanges = [{ startDate: "2015-08-14", endDate: "today" }];

    // 1) screenPageViews (lo que te dio 386 en el Explorer)
    const [r1] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges,
      metrics: [{ name: "screenPageViews" }],
    });
    let total = Number(r1?.rows?.[0]?.metricValues?.[0]?.value ?? 0);

    // 2) Fallback: contar eventos page_view si por alguna razón viene 0
    let fallback = 0;
    if (!total) {
      const [r2] = await client.runReport({
        property: `properties/${propertyId}`,
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
      fallback = Number(r2?.rows?.[0]?.metricValues?.[0]?.value ?? 0);
      if (fallback) total = fallback;
    }

    // DEBUG opcional ?debug=1
    if (req?.query?.debug === "1") {
      return res.status(200).json({
        totalViews: total,
        debug: {
          propertyId,
          dateRanges,
          screenPageViews: Number(r1?.rows?.[0]?.metricValues?.[0]?.value ?? 0),
          page_view_eventCount: fallback,
          env: {
            GA_CLIENT_EMAIL: !!clientEmail,
            GA_PRIVATE_KEY: !!privateKey,
            GA_PROPERTY_ID: propertyId,
          },
        },
      });
    }

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    return res.status(200).json({ totalViews: total });
  } catch (e: any) {
    console.error("GA total-views error:", e);
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
