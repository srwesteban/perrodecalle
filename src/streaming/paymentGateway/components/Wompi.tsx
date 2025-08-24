import { useMemo } from "react";
import WompiButton from "./Wompibutton";

export default function Wompi() {
  const reference = useMemo(() => `DON-${Date.now()}`, []);
  const redirectUrl =
    typeof window !== "undefined" ? `${window.location.origin}/gracias` : undefined;

  // Montos en pesos
  const amounts = [1500, 2000, 5000, 10000, 20000, 65000];

  return (
    <>
      <div>
        <p>Selecciona la donación que deseas hacer:</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {amounts.map((cop) => (
          <WompiButton
            key={cop}
            amountCOP={cop}      
            currency="COP"
            reference={reference}
            redirectUrl={redirectUrl}
          />
        ))}
      </div>
    </>
  );
}
