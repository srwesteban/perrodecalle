import * as React from "react";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useDonations } from "../hooks/useDonations";
import { formatCOP } from "../utils/format";

// clamp sin redondear
const clamp0to100 = (x: number) => (Number.isFinite(x) ? Math.max(0, Math.min(100, x)) : 0);

type Props = { goal: number };

function LinearProgressWithLabel({ value }: { value: number }) {
  const label = value >= 1 ? `${Math.round(value)}%` : `${value.toFixed(1)}%`;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      {/* minWidth:0 permite que el hijo se encoja en flex */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            height: 14,
            borderRadius: 7,
            [`&.${linearProgressClasses.colorPrimary}`]: { backgroundColor: "#064e3b" },
            [`& .${linearProgressClasses.bar}`]: {
              borderRadius: 7,
              background: "linear-gradient(90deg, #4ade80, #22c55e, #16a34a)",
              boxShadow: "0 0 10px #22c55e",
            },
          }}
        />
      </Box>
      <Typography
        variant="body2"
        noWrap
        sx={{
          color: "#4ade80",
          fontWeight: "bold",
          maxWidth: 64,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function ProgressBar({ goal }: Props) {
  const rows = useDonations();

  const { totalCOP, pct } = React.useMemo(() => {
    const approved = (rows ?? []).filter((d) => d.status === "APPROVED");
    const total = approved.reduce((acc, d) => acc + (d.amount_in_cents ?? 0) / 100, 0);
    const safeTotal = Number.isFinite(total) ? total : 0;
    const rawPct = goal > 0 ? (safeTotal / goal) * 100 : 0;
    return { totalCOP: safeTotal, pct: clamp0to100(rawPct) };
  }, [rows, goal]);

  return (
    <Box sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, gap: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ minWidth: 0, flex: 1 }}>
          Meta: ${formatCOP(goal)} COP
        </Typography>
        <Typography variant="body2" noWrap sx={{ fontWeight: "bold", maxWidth: "60%" }}>
          Recaudado: ${formatCOP(Math.floor(totalCOP))} COP
        </Typography>
      </Box>
      <LinearProgressWithLabel value={pct} />
    </Box>
  );
}
