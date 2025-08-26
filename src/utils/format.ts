// src/utils/format.ts
export function formatCOP(n: number) {
  // Fallback seguro si Intl falla o no existe
  try {
    if (typeof Intl !== "undefined" && Intl.NumberFormat) {
      return new Intl.NumberFormat("es-CO").format(n);
    }
  } catch {
    // ignore
  }
  // Manual: separadores de miles con puntos
  const int = Math.floor(isFinite(n) ? n : 0).toString();
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Asegura parseo consistente: si no hay 'Z' ni offset, asumimos UTC
export function safeTimeMs(isoMaybe: string | null | undefined) {
  if (!isoMaybe) return 0;
  const s = String(isoMaybe);
  const hasTZ = /[zZ]|[+\-]\d{2}:?\d{2}$/.test(s);
  const candidate = hasTZ ? s : s.endsWith("Z") ? s : s + "Z";
  const t = Date.parse(candidate);
  return isNaN(t) ? 0 : t;
}

export function clampPercent(x: number) {
  if (!isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 100) return 100;
  return Math.floor(x);
}
