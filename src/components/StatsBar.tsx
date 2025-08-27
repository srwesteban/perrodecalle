// src/components/StatsBar.tsx
import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Tooltip } from "@mui/material";

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
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        px: 1,
        overflow: "hidden",
      }}
    >
      {/* Logo izquierda (opcional) */}
      <Box
        component="img"
        src="https://css.mintic.gov.co/mt/mintic/new/img/logo_mintic_24_dark.svg"
        alt="MinTIC"
        loading="lazy"
        referrerPolicy="no-referrer"
        sx={{ height: 22, width: "auto", flexShrink: 0, filter: "contrast(1.15) saturate(1.05)" }}
      />

      {/* Texto centrado absoluto */}
      <Box
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          cursor: "default", // sin manito
        }}
      >
        <Tooltip
          title={err ? "ERR" : usersTxt}
          placement="bottom"
          arrow
          enterDelay={5000}        // 5s la primera vez…
          enterNextDelay={5000}    // …y también en las siguientes
          leaveDelay={0}
          disableFocusListener
          disableTouchListener
          componentsProps={{ tooltip: { sx: { fontSize: 12, px: 1, py: 0.5 } } }}
        >
          <Typography
            sx={{
              fontSize: 13,
              lineHeight: 1,
              fontWeight: 700,
              color: "common.white",
              fontVariantNumeric: "tabular-nums lining-nums",
              cursor: "inherit",
            }}
            aria-label="Visitas. Usuarios ocultos tras 5 segundos de hover."
          >
            Visitas: {err ? "ERR" : viewsTxt}
          </Typography>
        </Tooltip>
      </Box>
    </Box>
  );
}
