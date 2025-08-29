// src/components/ProgressBar.tsx
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";

// ⬇️ Usa la ruta que corresponda a tu proyecto:
// import { useGoalProgress } from "../../hooks/useDonations"; // si /hooks está fuera de /src
import { useGoalProgress } from "../hooks/useDonations"; // si /hooks está dentro de /src

type Props = {
  /** Meta en COP. Puede venir como número o string (ej: "5.000.000" o "$5.000.000"). */
  goalCOP: number | string;
  /** Cuántas filas sumar para el progreso (histórico). */
  sampleLimit?: number;
  /** Título encima de la barra. */
  title?: string;
};

const NF = new Intl.NumberFormat("es-CO");

const clamp0to100 = (x: number) =>
  Number.isFinite(x) ? Math.max(0, Math.min(100, x)) : 0;

/** Convierte una meta en COP a número seguro, limpiando $, puntos y comas. */
function parseCOP(input: number | string | undefined | null): number {
  if (typeof input === "number") return Number.isFinite(input) ? input : 0;
  const s = String(input ?? "");
  const digits = s.replace(/[^\d]/g, ""); // deja solo dígitos
  if (!digits) return 0;
  return Number(digits);
}

function LinearProgressWithLabel({ value }: { value: number }) {
  const v = clamp0to100(value);
  const label = v >= 1 ? `${Math.round(v)}%` : `${v.toFixed(1)}%`;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <LinearProgress variant="determinate" value={v} />
      </Box>
      <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function ProgressBar({
  goalCOP,
  sampleLimit = 500,
  title = "Progreso",
}: Props) {
  // Meta segura en COP (número)
  const metaCOP = React.useMemo(() => parseCOP(goalCOP), [goalCOP]);

  // El hook trabaja en CENTAVOS
  const goalInCents = React.useMemo(
    () => Math.max(1, Math.floor(metaCOP * 100)),
    [metaCOP]
  );

  const { percent, approvedCOP, loading, error, refetch } = useGoalProgress(
    goalInCents,
    sampleLimit
  );

  const safePercent = clamp0to100(percent ?? 0);

  return (
    <Box sx={{ display: "grid", gap: 1.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>

        {/* OJO: approvedCOP YA viene con $ → no agregues otro $ */}
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>
          Recaudado: <strong>{approvedCOP}</strong> / Meta:{" "}
          <strong>{metaCOP > 0 ? `$${NF.format(metaCOP)}` : "—"}</strong>
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "grid", gap: 1 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary">
            Cargando…
          </Typography>
        </Box>
      ) : (
        <LinearProgressWithLabel value={safePercent} />
      )}

      {error && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography variant="caption" color="error">
            {String(error)}
          </Typography>
          <Typography
            variant="caption"
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={refetch}
          >
            Reintentar
          </Typography>
        </Box>
      )}
    </Box>
  );
}
