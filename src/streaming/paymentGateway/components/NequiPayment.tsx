import { useEffect, useState } from "react";
import qr from "../../../assets/img/qrnequi.png";

export default function NequiPayment() {
  // ⚠️ Configura aquí tu número Nequi y monto (en pesos)
  const phone = "3XXXXXXXXX"; // 👈 tu número Nequi
  const amount = 15000;       // 👈 monto fijo
  const deeplink = `nequi://app/pay?phone=${phone}&amount=${amount}`;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white/5 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-white">Paga con Nequi</h3>

      {/* QR siempre visible */}
      <div className="flex flex-col items-center gap-2">
        <img
          src={qr}
          alt="QR para pagar con Nequi"
          className="w-56 h-56 object-contain rounded-lg shadow-md"
        />
        <p className="text-sm text-gray-300 text-center">
          Escanea este QR desde la app Nequi o cualquier billetera habilitada
        </p>
      </div>

      {/* Botón siempre visible */}
      <a
        href={deeplink}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition"
      >
        Abrir Nequi y pagar
      </a>
      <p className="text-xs text-gray-400 text-center">
        Si estás en celular, puedes abrir Nequi directamente con este botón.
      </p>

      {/* Advertencia */}
      <p className="text-xs text-gray-400 text-center">
        Si el pago es por QR puede tardar hasta 24h en reflejarse en la página.
      </p>
    </div>
  );
}