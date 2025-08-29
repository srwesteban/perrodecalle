import { useDonations } from "../hooks/useDonations";
import { formatDateTime } from "../utils/format";

function StatusBadge({ s }: { s: string }) {
  const base = "px-2 py-0.5 rounded text-xs font-semibold";
  const map: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-800",
    DECLINED: "bg-rose-100 text-rose-800",
    VOIDED: "bg-amber-100 text-amber-800",
    PENDING: "bg-slate-200 text-slate-800",
  };
  const cls = map[s as keyof typeof map] ?? "bg-slate-200 text-slate-800";
  return <span className={`${base} ${cls}`}>{s}</span>;
}

export default function DonationsTable() {
  const rows = useDonations(50);

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-[720px] w-full text-left">
        <thead className="bg-slate-50 text-slate-600 text-sm">
          <tr>
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Referencia</th>
            <th className="px-3 py-2">Monto</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2">ID</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-slate-100">
              <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(r.updated_at ?? r.created_at)}</td>
              <td className="px-3 py-2 font-mono text-xs">{r.reference}</td>
              <td className="px-3 py-2">{r.amountFormatted}</td>
              <td className="px-3 py-2"><StatusBadge s={r.status} /></td>
              <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{r.id}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                Sin registros todavía. Haz un pago de prueba para verlos aquí.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
