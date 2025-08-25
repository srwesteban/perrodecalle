import { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";

type Totals = { views: number; users: number };

export default function StatsBar() {
  const [data, setData] = useState<Totals | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch("/api/ga/totals", { cache: "no-store", signal: ac.signal });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as Partial<Totals>;
        setData({ views: Number(j.views ?? 0), users: Number(j.users ?? 0) });
      } catch (e: any) {
        if (!ac.signal.aborted) setErr(e.message || "Error");
      }
    })();
    return () => ac.abort();
  }, []);

  const nf = useMemo(() => new Intl.NumberFormat("es-CO"), []);
  const viewsTxt = data ? nf.format(data.views) : "…";
  const usersTxt = data ? nf.format(data.users) : "…";

  return (
    <Box
      // IMPORTANTÍSIMO: no sumar altura; la toma del contenedor (28px)
      sx={{
        height: "100%",
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        gap: 1,              // 8px entre logo y texto
        px: 1,               // algo de aire lateral; el ancho no importa
        whiteSpace: "nowrap",
        overflow: "hidden",
        lineHeight: 1,
      }}
    >
      {/* LOGO: protagonista sin romper altura (20px en una barra de 28px) */}
      <Box
        component="img"
        src="https://css.mintic.gov.co/mt/mintic/new/img/logo_mintic_24_dark.svg"
        alt="MinTIC"
        loading="lazy"
        referrerPolicy="no-referrer"
        sx={{
          height: 20,
          width: "auto",
          flexShrink: 0,
          filter: "contrast(1.15) saturate(1.05)",
        }}
      />

      {/* Texto ultra compacto y de alto contraste */}
      <Typography
        component="span"
        sx={{
          fontSize: 13,             // pequeño pero claro
          lineHeight: 1,            // CERO pérdida vertical
          fontWeight: 700,          // sólido
          color: "common.white",    // máximo contraste sobre tu bg oscuro
          letterSpacing: 0.1,
          fontVariantNumeric: "tabular-nums lining-nums",
          display: "inline-flex",
          alignItems: "center",
          gap: 1,                   // separaciones eficientes
        }}
      >
        <Box component="span" sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
          Visitas:
        </Box>
        <Box component="span">{err ? "ERR" : viewsTxt}</Box>

        <Box component="span" sx={{ mx: 0.75, opacity: 0.5 }}>•</Box>

        <Box component="span" sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
          Usuarios:
        </Box>
        <Box component="span">{err ? "ERR" : usersTxt}</Box>
      </Typography>
    </Box>
  );
}
