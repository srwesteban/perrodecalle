import { useState } from "react";

export default function NotaConPopup() {
  const [open, setOpen] = useState(false); // 👈 aquí defines el state

  return (
    <>
      <p
        className="
          col-span-2 mt-2 px-3 py-2
          text-sm sm:text-base leading-snug
          text-yellow-200 font-medium text-center
          bg-yellow-900/30 rounded-lg
        "
      >
        ⚠️ Nota: A veces <span className="font-semibold">Nequi</span> puede
        presentar fallas. Si ocurre, intenta con otro medio de pago disponible.
        También puedes hacerlo por QR{" "}
        <button
          onClick={() => setOpen(true)}
          className="
            underline underline-offset-4 decoration-yellow-300 hover:decoration-yellow-200
            text-yellow-100 hover:text-white transition font-semibold
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 rounded
          "
        >
          aquí
        </button>
      </p>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/80"
          onClick={() => setOpen(false)}
        >
          {/* Botón cerrar */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setOpen(false)}
              className="text-white text-lg font-bold"
            >
              ✕
            </button>
          </div>

          {/* Imagen QR */}
          <div className="flex-1 flex items-center justify-center px-4">
            <img
              src="src/assets/img/qrnequi.png" // 👈 pon tu QR aquí
              alt="QR para donar"
              className="max-h-[70vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Texto de advertencia abajo */}
          <div className="bg-red-800 py-3 text-center mb-10">
            <p className="text-sm text-white">
              Por este método el pago se craga a la pagina en 24 h.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
