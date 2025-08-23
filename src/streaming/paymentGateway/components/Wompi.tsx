import { useMemo } from "react";
import WompiButton from "./Wompibutton";

export default function Wompi() {
  const reference = useMemo(() => `DON-${Date.now()}`, []); // fija la ref 1 sola vez

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Este es el botón real de Wompi Donar</h3>
      <WompiButton
        amountInCents={150000}              // ✅ $1.500 COP
        currency="COP"                      // ✅ mayúsculas
        reference={reference}               // ✅ debe coincidir con la firma
        redirectUrl={`${window.location.origin}/gracias`}
      />
    </div>
  );
}
