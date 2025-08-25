// src/components/StatsBar.tsx
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

type Metric = { value: number | null; loading: boolean; error?: string };

function useMetric(url: string, key: "totalViews" | "totalUsers"): Metric {
  const [state, setState] = useState<Metric>({ value: null, loading: true });
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setState({ value: null, loading: true });
        const r = await fetch(url, { cache: "no-store", signal: ac.signal });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        setState({ value: Number(j?.[key] ?? 0), loading: false });
      } catch (e: any) {
        if (!ac.signal.aborted) setState({ value: null, loading: false, error: e?.message || "ERR" });
      }
    })();
    return () => ac.abort();
  }, [url, key]);
  return state;
}

export default function StatsBar() {
  const views = useMetric("/api/ga/total-views", "totalViews");
  const users = useMetric("/api/ga/total-users", "totalUsers");

  const viewsTxt = views.loading ? "…" : views.error ? "ERR" : (views.value ?? 0).toLocaleString();
  const usersTxt = users.loading ? "…" : users.error ? "ERR" : (users.value ?? 0).toLocaleString();

  return (
    <Box
      component="section"
      aria-label="Estadísticas del sitio"
      sx={{
        // ALTURA: tope absoluto 1cm
        maxHeight: "1cm",
        py: 0, my: 0,
        // LÍNEA ÚNICA, SIN SALTOS
        display: "flex",
        alignItems: "center",
        gap: 1,
        whiteSpace: "nowrap",
        overflow: "hidden",
        // TIPOGRAFÍA MUY COMPACTA
        fontSize: { xs: "11px", sm: "12px" },
        lineHeight: 1.2,
        color: "text.secondary",
      }}
    >
      {/* Logo (muy pequeño) */}
      <Box
        component="img"
        src="https://css.mintic.gov.co/mt/mintic/new/img/logo_mintic_24_dark.svg"
        alt="MinTIC"
        loading="lazy"
        referrerPolicy="no-referrer"
        sx={{ height: 14, width: "auto", flexShrink: 0, opacity: 0.85 }}
      />

      {/* Separador discreto */}
      <Typography component="span" sx={{ px: 0.5, color: "divider" }}>•</Typography>

      {/* Texto compacto, todo en una sola línea */}
      <Typography
        component="span"
        sx={{
          color: "text.primary",
          fontWeight: 500,
          letterSpacing: 0.1,
          minWidth: 0,
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        Visitas: {viewsTxt}
        <Typography component="span" sx={{ mx: 1, color: "text.disabled" }}>·</Typography>
        Usuarios: {usersTxt}
      </Typography>
    </Box>
  );
}
