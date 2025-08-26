// components/ProgressBar.tsx
import * as React from "react";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useDonations } from "../hooks/useDonations";

type Props = {
  goal: number;
};

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
              backgroundColor: "#064e3b", // verde oscuro para el fondo vacío
            },
            [`& .${linearProgressClasses.bar}`]: {
              borderRadius: 7,
              background: "linear-gradient(90deg, #4ade80, #22c55e, #16a34a)",
              // verde brillante → verde intenso → verde oscuro
              boxShadow: "0 0 10px #22c55e", // efecto glow
            },
          }}
        />
      </Box>
      <Typography
        variant="body2"
        sx={{ color: "#4ade80", fontWeight: "bold", minWidth: 36 }}
      >
        {`${Math.round(value)}%`}
      </Typography>
    </Box>
  );
}

export default function ProgressBar({ goal }: Props) {
  const rows = useDonations();

  const { totalCOP, pct } = React.useMemo(() => {
    const total =
      (rows ?? [])
        .filter((d) => d.status === "APPROVED")
        .reduce((acc, d) => acc + ((d.amount_in_cents ?? 0) / 100), 0) || 0;

    const percent = goal > 0 ? Math.min(100, Math.floor((total / goal) * 100)) : 0;
    return { totalCOP: total, pct: percent };
  }, [rows, goal]);

  return (
    <Box sx={{ width: "100%", height: "10px"}}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, gap: 1 }}>
        <Typography variant="body2" >
          Meta: ${goal.toLocaleString("es-CO")} COP
        </Typography>
        <Typography variant="body2" sx={{  fontWeight: "bold" }}>
          Recaudado: ${Math.floor(totalCOP).toLocaleString("es-CO")} COP
        </Typography>
      </Box>

      <LinearProgressWithLabel value={pct} />
    </Box>
  );
}
