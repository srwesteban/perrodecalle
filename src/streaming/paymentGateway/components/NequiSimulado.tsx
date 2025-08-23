// src/streaming/paymentGateway/components/NequiSimulado.tsx
import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function NequiSimulado() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const sim = async () => {
    setMsg(null);
    setLoading(true);
    const ref = `sim-${Date.now()}`;

    try {
      // INSERT PENDING
      const { error: insErr } = await supabase.from("donations").insert({
        reference: ref,
        status: "PENDING",           // enum válido: PENDING
        amount_in_cents: 150000,     // $1.500
        provider: "sim",
      });
      if (insErr) throw insErr;

      // UPDATE a APPROVED después de 2s
      setTimeout(async () => {
        const { error: updErr } = await supabase
          .from("donations")
          .update({ status: "APPROVED" }) // enum válido: APPROVED
          .eq("reference", ref);

        setLoading(false);
        if (updErr) {
          setMsg(`Update error: ${updErr.message}`);
          console.error(updErr);
        } else {
          setMsg(`OK: ${ref} → APPROVED`);
        }
      }, 2000);
    } catch (e: any) {
      setLoading(false);
      setMsg(`Insert error: ${e?.message || e}`);
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={sim}
        disabled={loading}
        className="w-full px-3 py-2 rounded bg-purple-600 disabled:opacity-60"
      >
        {loading ? "Simulando..." : "Simular Donacion"}
      </button>
      {msg && <p className="text-xs text-gray-300">{msg}</p>}
    </div>
  );
}
