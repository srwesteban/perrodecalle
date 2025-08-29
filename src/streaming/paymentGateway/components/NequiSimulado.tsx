// src/streaming/paymentGateway/components/NequiSimulado.tsx
import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function NequiSimulado() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [lastRef, setLastRef] = useState<string | null>(null);

  const sim = async () => {
    setMsg(null);
    setLoading(true);

    // referencia única
    const ref = `sim-${Date.now()}`;
    setLastRef(ref);

    try {
      // INSERT → PENDING
      const { data: insData, error: insErr } = await supabase
        .from("donations")
        .insert({
          reference: ref,
          status: "PENDING",        // enum válido
          amount_in_cents: 150000,  // $1.500
          provider: "sim",
        })
        .select();

      console.log("INSERT donations →", { insData, insErr });
      if (insErr) throw insErr;

      // UPDATE → APPROVED (2s después)
      setTimeout(async () => {
        const { data: updData, error: updErr } = await supabase
          .from("donations")
          .update({ status: "APPROVED" }) // enum válido
          .eq("reference", ref)
          .select();

        console.log("UPDATE donations →", { updData, updErr });
        setLoading(false);

        if (updErr) {
          setMsg(`Update error: ${updErr.message}`);
        } else {
          setMsg(`OK: ${ref} → APPROVED`);
        }
      }, 2000);
    } catch (e: any) {
      console.error("SIM ERROR →", e);
      setLoading(false);
      setMsg(`Insert error: ${e?.message || e}`);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg bg-slate-800 text-slate-100">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">NequiSimulado</span>
        {lastRef && (
          <code className="text-xs bg-slate-900 px-2 py-1 rounded">
            {lastRef}
          </code>
        )}
      </div>
      

      <button
        onClick={sim}
        disabled={loading}
        className="w-full px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
      >
        {loading ? "Simulando..." : "Simular Donación (PENDING → APPROVED)"}
      </button>

      {msg && <p className="text-xs">{msg}</p>}

      <p className="text-[11px] text-slate-300 leading-snug">
        Mira la consola del navegador para <b>INSERT/UPDATE</b> y verifica la tabla
        <b> public.donations</b>. Si falla, suele ser por <b>RLS/policies</b> o envs
        de Supabase.
      </p>
    </div>
  );
}
