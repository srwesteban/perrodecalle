// api/analytics.ts
import type { IncomingMessage, ServerResponse } from "http";
import { google } from "googleapis";

export default async function handler(
  _req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const jwt = new google.auth.JWT({
      email: process.env.GA_CLIENT_EMAIL,
      key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    await jwt.authorize();

    const analyticsreporting = google.analyticsreporting("v4");

    const response = await analyticsreporting.reports.batchGet({
      auth: jwt,
      requestBody: {
        reportRequests: [
          {
            viewId: process.env.GA_VIEW_ID,
            dateRanges: [{ startDate: "2020-01-01", endDate: "today" }],
            metrics: [{ expression: "ga:sessions" }],
          },
        ],
      },
    });

    const totalVisits =
      response.data.reports?.[0].data?.totals?.[0].values?.[0] || "0";

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ visits: totalVisits }));
  } catch (error: any) {
    console.error("❌ Error en Analytics API:", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message }));
  }
}
