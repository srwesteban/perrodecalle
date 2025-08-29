// Devuelve el JSON de la transacción por id usando el ambiente correcto (sandbox/prod)
export default async function handler(req: any, res: any) {
  try {
    const u = new URL(req.url, `http://${req.headers.host}`);
    const id = u.searchParams.get("id");
    if (!id) { res.statusCode = 400; return res.end("id requerido"); }

    const pk = process.env.WOMPI_PUBLIC_KEY || process.env.VITE_WOMPI_PUBLIC_KEY || "";
    const isProd = pk.startsWith("pub_prod_");
    const host = isProd ? "https://production.wompi.co" : "https://sandbox.wompi.co";

    const r = await fetch(`${host}/v1/transactions/${encodeURIComponent(id)}`);
    const text = await r.text();

    res.statusCode = r.status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(text);
  } catch (e: any) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: e?.message || "error" }));
  }
}
