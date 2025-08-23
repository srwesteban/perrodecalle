import { useEffect, useMemo, useState } from "react";
import type { DogStats } from "../hooks/useDogs";
import { useDonations } from "../hooks/useDonations";

const nf = new Intl.NumberFormat("es-CO");

export default function FeedDogCard({ dog }: { dog: DogStats }) {
  // Observa donaciones para este perro (link_ref)
  const rows = useDonations(100);
  const approved = useMemo(
    () => rows.some(r => r.reference === dog.link_ref && r.status === "APPROVED"),
    [rows, dog.link_ref]
  );

  // Persistencia por navegador: si ya se aprobó, bloquea botón
  const storageKey = `fed:${dog.link_ref}`;
  const [locked, setLocked] = useState<boolean>(() => localStorage.getItem(storageKey) === "1");
  useEffect(() => {
    if (approved) {
      localStorage.setItem(storageKey, "1");
      setLocked(true);
    }
  }, [approved]);

  const [opening, setOpening] = useState(false);
  const openPopup = () => {
    if (locked) return;
    setOpening(true);
    const w = window.open(
      `https://checkout.bold.co/payment/${dog.link_ref}`,
      "bold_checkout",
      "width=480,height=720,menubar=no,toolbar=no,location=no,status=no"
    );
    const t = setInterval(() => {
      if (!w || w.closed) {
        clearInterval(t);
        setOpening(false);
      }
    }, 800);
  };

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur p-4 shadow-lg flex flex-col gap-3">
      <img
        src={dog.image_url}
        alt={dog.name}
        className="w-full h-40 object-cover rounded-xl"
        loading="lazy"
      />
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{dog.name}</h3>
        <span className="text-sm text-gray-300">${nf.format(dog.price_cop)} COP</span>
      </div>

      <button
        onClick={openPopup}
        disabled={locked || opening}
        className={`w-full px-4 py-2 rounded-xl font-semibold transition
          ${locked ? "bg-emerald-600/60 cursor-not-allowed" : "bg-blue-600 hover:opacity-90 text-white"}`}
      >
        {locked ? "¡Alimentado!" : opening ? "Abriendo…" : `Alimentar a ${dog.name}`}
      </button>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Alimentado: {dog.feeds} veces</span>
        <span>Recaudado: ${nf.format(dog.raised_cop)} COP</span>
      </div>
    </div>
  );
}
