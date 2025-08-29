// src/utils/format.ts
// Igual al tuyo + un par de helpers opcionales
export function formatCOP(n: number) {
  try {
    if (typeof Intl !== "undefined" && Intl.NumberFormat) {
      return new Intl.NumberFormat("es-CO").format(n);
    }
  } catch {}
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

export function formatDateTime(isoMaybe: string | null | undefined) {
  const ms = safeTimeMs(isoMaybe);
  if (!ms) return "—";
  return new Date(ms).toLocaleString("es-CO", { hour12: false });
}
