import * as React from "react";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useDonations } from "../hooks/useDonations";
import { formatCOP } from "../utils/format";

const clamp0to100 = (x: number) => (Number.isFinite(x) ? Math.max(0, Math.min(100, x)) : 0);

// Quita tildes, trim y pasa a mayúsculas
const normalize = (s: unknown) =>
  (String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toUpperCase());

// True si el estado representa aprobado (APPROVED, APROBADA, SUCCESS, PAID…)
const isApproved = (status: unknown) => {
  const s = normalize(status);
  return s === "APPROVED" || s === "APROBADA" || s === "PAID" || s === "SUCCESS";
};

// Convierte centavos a COP (entero) aunque venga en string o null
const centsToCop = (cents: unknown) => {
  const n = Number(cents);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n / 100)) : 0;
};

type Props = { goal: number };

function LinearProgressWithLabel({ value }: { value: number }) {
  const safe = clamp0to100(value);
  const label = safe >= 1 ? `${Math.round(safe)}%` : `${safe.toFixed(1)}%`;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <LinearProgress
          variant="determinate"
          value={safe}
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
        sx={{ color: "#4ade80", fontWeight: "bold", maxWidth: 64, textAlign: "right", flexShrink: 0 }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function ProgressBar({ goal }: Props) {
  const rows = useDonations();

  const { totalCOP, pct } = React.useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    const approved = list.filter((d) => isApproved((d as any).status));
    const total = approved.reduce((acc, d: any) => acc + centsToCop(d.amount_in_cents), 0);
    const safeGoal = Number.isFinite(goal) && goal > 0 ? goal : 0;
    const rawPct = safeGoal > 0 ? (total / safeGoal) * 100 : 0;
    return { totalCOP: total, pct: clamp0to100(rawPct) };
  }, [rows, goal]);

  return (
    <Box sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, gap: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ minWidth: 0, flex: 1 }}>
          Meta: ${formatCOP(goal)} COP
        </Typography>
        <Typography variant="body2" noWrap sx={{ fontWeight: "bold", maxWidth: "60%" }}>
          Recaudado: ${formatCOP(totalCOP)} COP
        </Typography>
      </Box>
      <LinearProgressWithLabel value={pct} />
    </Box>
  );
}
