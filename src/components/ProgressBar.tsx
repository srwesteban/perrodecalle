import * as React from "react";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useGoalProgress } from "../hooks/useDonations";

// clamp sin redondear
const clamp0to100 = (x: number) =>
  Number.isFinite(x) ? Math.max(0, Math.min(100, x)) : 0;

type Props = { goal: number | string }; // acepta número o string

function LinearProgressWithLabel({ value }: { value: number }) {
  const v = clamp0to100(value);
  const label = v >= 1 ? `${Math.round(v)}%` : `${v.toFixed(1)}%`;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <LinearProgress
          variant="determinate"
          value={v}
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
  // convierto la meta a número seguro
  const safeGoal = React.useMemo(() => {
    if (typeof goal === "number") return goal;
    if (typeof goal === "string") {
      const digits = goal.replace(/[^\d]/g, "");
      return digits ? Number(digits) : 0;
    }
    return 0;
  }, [goal]);

  // Pasamos meta en CENTAVOS al hook
  const { percent, approvedCents, approvedCOP, loading, error } =
    useGoalProgress(safeGoal * 100);

  return (
    <Box sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 0.5,
          gap: 1,
          minWidth: 0,
        }}
      >
        <Typography variant="body2" noWrap sx={{ minWidth: 0, flex: 1 }}>
          Meta: ${safeGoal.toLocaleString("es-CO")} COP
        </Typography>
        <Typography
          variant="body2"
          noWrap
          sx={{ fontWeight: "bold", maxWidth: "60%" }}
        >
          Recaudado: {approvedCOP}
        </Typography>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : error ? (
        <Typography variant="caption" color="error">
          {String(error)}
        </Typography>
      ) : (
        <LinearProgressWithLabel value={percent} />
      )}
    </Box>
  );
}
