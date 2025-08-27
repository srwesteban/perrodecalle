import React, { memo, useMemo } from "react";
import WompiButton, { formatCOP } from "../streaming/paymentGateway/components/WompiButton";
import CustomAmountButton from "../streaming/paymentGateway/components/CustomAmountButton";
import SafeDonation from "./SafeDonation";
import { Opacity } from "@mui/icons-material";

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
  // Prefijo estable para toda la sesión de la vista
  const referenceBase = useMemo(
    () => `DON-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  // Vuelve a la raíz del sitio (no a /gracias) tras el checkout
  const redirectUrl =
    typeof window !== "undefined" ? window.location.origin : undefined;

  const buttonClass =
    "w-full h-16 rounded-xl bg-emerald-500 text-black font-semibold " +
    "hover:bg-emerald-400 active:bg-emerald-300 " +
    "shadow-[0_1px_0_rgba(255,255,255,.25)_inset,0_8px_24px_rgba(16,185,129,.25)] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 " +
    "transition-all flex items-center justify-center overflow-hidden";

  return (
    <section className="space-y-4">
      <header className="text-center mb-2 sm:mb-4 px-2">
        <h3 className="text-xl font-semibold tracking-tight">Apoya hoy</h3>
        <p className="text-xs text-white/80">
          Cada aporte se convierte en alimento y cuidados. 💛
        </p>
      </header>

      {/* Grilla de montos fijos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {AMOUNTS.map((cop) => (
          <WompiButton
            key={cop}
            amountCOP={cop}               // ✅ En PESOS; el botón convierte a centavos internamente
            currency="COP"
            referenceBase={referenceBase}
            redirectUrl={redirectUrl}
            className={buttonClass}
          >
            <div className="flex flex-col items-center leading-tight">
              <span className="text-base sm:text-lg">{formatCOP(cop)}</span>
              <span className="text-[10px] text-black sm:text-xs font-bold opacity-80">
                {SUBS[cop] ?? "Aporte"}
              </span>
            </div>
          </WompiButton>
        ))}

        <CustomAmountButton referenceBase={referenceBase} className={buttonClass} />


      </div>

      {/* Sello de seguridad / info */}
      <div className="mt-2 lg:mt-6">
        <SafeDonation />
      </div>
    </section>
  );
}

const DonationSection = memo(DonationSectionComponent);
export default DonationSection;
