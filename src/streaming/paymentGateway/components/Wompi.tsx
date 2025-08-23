import { useMemo } from "react";
import WompiButton from "./Wompibutton";

export default function Wompi() {
  const reference = useMemo(() => `DON-${Date.now()}`, []); // ✅ estable

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Este es el botón real de Wompi Donar</h3>
      <WompiButton
        amountInCents={500000}  // ver punto 2
        reference={reference}
        redirectUrl={`${window.location.origin}/gracias`}
      />
    </div>
  );
}
