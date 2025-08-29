import { useEffect, useState } from "react";

export default function WompiResult() {
  const [json, setJson] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) { setErr("Falta ?id"); return; }
    fetch(`/api/wompi/tx?id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(setJson)
      .catch(e => setErr(String(e)));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-4">Resultado Wompi</h1>
      {err ? (
        <pre className="text-red-600">{err}</pre>
      ) : (
        <pre className="bg-slate-900 text-slate-100 p-4 rounded overflow-auto text-xs">
          {JSON.stringify(json, null, 2)}
        </pre>
      )}
      <a href="/" className="text-emerald-600 underline block mt-4">Volver</a>
    </div>
  );
}
