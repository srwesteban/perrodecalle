// src/streaming/paymentGateway/components/NequiSimulado.tsx
import { supabase } from "../../../lib/supabase";
import { useState } from "react";

export default function NequiSimulado() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function simular() {
    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase
      .from("donations")
      .insert({
        reference: `TEST-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        amount_in_cents: 250000, // $2.500 COP
        currency: "COP",
        status: "APPROVED",
        tx_id: null,
      })
      .select("id, reference, amount_in_cents, amount_cop, status")
      .single();

    if (error) {
      console.error("Supabase INSERT error:", error);
      setMsg("❌ Error insertando en Supabase (abre la consola para detalles).");
    } else {
      console.log("✅ Insert ok:", data);
      setMsg(`✅ Donación simulada: ${data.reference}`);
      // Fallback: avisar al hook para recargar por si no llegó el evento Realtime
      window.dispatchEvent(new Event("donation:inserted"));
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-bold">📱 Nequi (simulación)</p>
      <button
        disabled={loading}
        onClick={simular}
        className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? "Insertando..." : "Simular donación $2.500"}
      </button>
      {msg && <p className="text-sm text-gray-200">{msg}</p>}
    </div>
  );
}
