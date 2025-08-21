import { useMemo } from "react";
import { useDonations } from "../hooks/useDonations";

type Props = {
  current?: number;
  goal: number;
};

export default function ProgressBar({ current, goal }: Props) {
  const rows = useDonations(200);
  const total = useMemo(() => {
    if (typeof current === "number") return current;
    return rows.filter(r => r.status === "APPROVED").reduce((s, r) => s + (r.amount_in_cents ?? 0), 0);
  }, [rows, current]);

  const pct = Math.min(100, Math.round((total / goal) * 100));

  return (
    <div>
      <p className="mb-2 font-bold">Meta de donaciones</p>
      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
        <div className="bg-blue-500 h-4 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-sm text-gray-400">
        ${(total / 100).toLocaleString("es-CO")} / ${(goal / 100).toLocaleString("es-CO")} ({pct}%)
      </p>
    </div>
  );
}
