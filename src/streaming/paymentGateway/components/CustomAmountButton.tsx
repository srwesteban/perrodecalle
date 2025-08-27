import { useRef } from "react";
import { openWompiCheckout, formatCOP } from "./WompiButton";

type Props = {
  referenceBase: string;
  className?: string;
  minCOP?: number;
  maxCOP?: number;
  redirectUrl?: string;
  expirationTimeISO?: string;
};

export default function CustomAmountButton({
  referenceBase,
  className = "",
  minCOP = 1000,
  maxCOP = 5_000_000,
  redirectUrl,
  expirationTimeISO,
}: Props) {
  const openingRef = useRef(false);

  const onClick = async () => {
    if (openingRef.current) return;
    openingRef.current = true;

    try {
      const raw = prompt(
        `Ingresa el valor en pesos (entre ${formatCOP(minCOP)} y ${formatCOP(maxCOP)}):`
      );
      if (!raw) return;

      const cop = Math.round(Number(raw.replace(/[^\d]/g, "")));
      if (!Number.isFinite(cop) || cop < minCOP || cop > maxCOP) {
        alert("Monto inválido.");
        return;
      }

      await openWompiCheckout({
        amountInCents: cop * 100,
        referenceBase,
        redirectUrl,
        expirationTimeISO,
      });
    } finally {
      openingRef.current = false;
    }
  };

  return (
    <button type="button" onClick={onClick} className={className} aria-label="Donar otro monto">
      <div className="leading-tight text-center px-2 w-full">
        <div className="text-base font-semibold">Otro monto</div>
        <div className="text-[11px] opacity-90 truncate">Personaliza tu aporte</div>
      </div>
    </button>
  );
}
