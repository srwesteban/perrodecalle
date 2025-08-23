import { useMemo } from "react";
import WompiButton from "./Wompibutton";

export default function Wompi() {
  const reference = useMemo(() => `DON-${Date.now()}`, []);
  const redirectUrl =
    typeof window !== "undefined" ? `${window.location.origin}/gracias` : undefined;

  // Montos en pesos (se convierten a centavos más abajo)
  const amounts = [1500, 2000, 5000, 10000, 20000, 65000];

  return (
    <div className="flex flex-wrap gap-2">
      {amounts.map((cop) => (
        <WompiButton
          key={cop}
          amountInCents={cop * 100}   // 1.500 → 150000 centavos
          currency="COP"
          reference={reference}
          redirectUrl={redirectUrl}
        />
      ))}
    </div>
  );
}
