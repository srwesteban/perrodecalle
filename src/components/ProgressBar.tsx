// components/ProgressBar.tsx
import * as React from "react";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useDonations } from "../hooks/useDonations";
import { clampPercent, formatCOP } from "../utils/format";

type Props = { goal: number };

function LinearProgressWithLabel({ value }: { value: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            height: 14,
            borderRadius: 7,
            [`&.${linearProgressClasses.colorPrimary}`]: {
              backgroundColor: "#064e3b",
            },
            [`& .${linearProgressClasses.bar}`]: {
              borderRadius: 7,
              background: "linear-gradient(90deg, #4ade80, #22c55e, #16a34a)",
              boxShadow: "0 0 10px #22c55e",
            },
          }}
        />
      </Box>
      <Typography variant="body2" sx={{ color: "#4ade80", fontWeight: "bold", minWidth: 36 }}>
        {`${Math.round(value)}%`}
      </Typography>
    </Box>
  );
}

export default function ProgressBar({ goal }: Props) {
  const rows = useDonations();

  const { totalCOP, pct } = React.useMemo(() => {
    const approved = (rows ?? []).filter((d) => d.status === "APPROVED");
    const total = approved.reduce((acc, d) => acc + ((d.amount_in_cents ?? 0) / 100), 0);
    const safeTotal = isFinite(total) ? total : 0;
    const rawPct = goal > 0 ? (safeTotal / goal) * 100 : 0;
    return { totalCOP: safeTotal, pct: clampPercent(rawPct) };
  }, [rows, goal]);

  return (
    <Box sx={{ width: "100%", height: "10px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, gap: 1 }}>
        <Typography variant="body2">
          Meta: ${formatCOP(goal)} COP
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Recaudado: ${formatCOP(Math.floor(totalCOP))} COP
        </Typography>
      </Box>
      <LinearProgressWithLabel value={pct} />
    </Box>
  );
}
