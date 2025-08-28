import React, { memo, useMemo } from "react";
import WompiButton, {
  formatCOP,
} from "../streaming/paymentGateway/components/WompiButton";
import CustomAmountButton from "../streaming/paymentGateway/components/CustomAmountButton";
import SafeDonation from "./SafeDonation";
import NequiPopup from "./NequiPopup";
import logowompi from "../assets/img/logowompi.png";

const AMOUNTS = [
  1500, 2500, 5000, 10000, 20000, 34900, 64900, 100000, 200000, 350000, 500000,
] as const;

const SUBS: Record<number, string> = {
  1500: "Primer apoyo",
  2500: "Snack x1",
  5000: "Snack x2",
  10000: "2 comidas",
  20000: "Día completo",
  34900: "Cuidados y vet",
  64900: "Bolsa concentrado",
  100000: "Aporte grande",
  200000: "Aporte héroe",
  350000: "Aporte leyenda",
  500000: "Aporte épico",
};

function DonationSectionComponent() {
  const referenceBase = useMemo(
    () => `DON-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  // ⬇️ vuelve a la RAÍZ del comercio (no /gracias)
  const redirectUrl =
    typeof window !== "undefined" ? window.location.origin : undefined;

  const buttonClass =
    "w-full h-14 rounded-xl bg-emerald-500 text-black font-semibold " +
    "hover:bg-emerald-400 active:bg-emerald-300 " +
    "shadow-[0_1px_0_rgba(255,255,255,.25)_inset,0_8px_24px_rgba(16,185,129,.25)] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 " +
    "transition-all flex items-center justify-center overflow-hidden";

  return (
    <section className="space-y-3 mb-1 mt-0 xs:mt-2">
      <header className="text-center">
        <div
          className="
      flex items-center justify-center gap-2 px-3 py-1
      rounded-lg bg-white shadow-md
    "
        >
          <span className="text-gray-800 font-semibold text-lg sm:text-xl mb-1">
            Dona con:
          </span>

          <img
            src={logowompi}
            alt="Wompi"
            className="h-5 sm:h-7 object-contain"
          />
        </div>

        <p className="text-xs text-white/80 mt-1 sm:mt-2 max-w-md mx-auto">
          Cada aporte se convierte en alimento y cuidados. 💛 Presiona en
          cualquiera de los siguientes botones:
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        {AMOUNTS.map((cop) => (
          <WompiButton
            key={cop}
            amountCOP={cop}
            reference={referenceBase}
            redirectUrl={redirectUrl} // vuelve a la raíz del dominio
            className={buttonClass}
          >
            <div className="leading-tight text-center px-2 w-full">
              <div className="text-base font-semibold truncate">
                {formatCOP(cop)}
              </div>
              <div className="text-[11px] opacity-90 truncate">
                {SUBS[cop] ?? "¡Gracias!"}
              </div>
            </div>
          </WompiButton>
        ))}

        <CustomAmountButton
          referenceBase={referenceBase}
          redirectUrl={redirectUrl} // idem
          className={buttonClass}
        />
      </div>
      {/* <NotaConPopup/> */}
      <NequiPopup />

      <div className="m-0">
        <SafeDonation />
      </div>
    </section>
  );
}

const DonationSection = memo(DonationSectionComponent);
export default DonationSection;
