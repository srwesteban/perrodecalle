// src/components/DonationSection.tsx
import { memo, useMemo } from "react";
import WompiButton, {
  formatCOP,
} from "../streaming/paymentGateway/components/WompiButton";
import CustomAmountButton from "../streaming/paymentGateway/components/CustomAmountButton";
import SafeDonation from "./SafeDonation";

const AMOUNTS = [1500, 5000, 10000, 20000, 34900, 64900, 100000, 500000];
const SUBS: Record<number, string> = {
  1500: "Primer apoyo",
  5000: "Snack",
  10000: "2 comidas",
  20000: "Día completo",
  34900: "Cuidados y vet",
  64900: "Bolsa concentrado",
  100000: "Aporte grande",
  500000: "Aporte héroe",
};

function DonationSection() {
  const referenceBase = useMemo(
    () => `DON-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  // 🎨 estilo único para TODOS los botones (mismo peso visual)
  const buttonClass = `
    w-full h-16 rounded-xl
    bg-emerald-500 text-black font-semibold
    hover:bg-emerald-400 active:bg-emerald-300
    shadow-[0_1px_0_rgba(255,255,255,.25)_inset,0_8px_24px_rgba(16,185,129,.25)]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300
    transition-all
    flex items-center justify-center
  `;

  return (
    <section className="space-y-3">
      <header className="text-center mb-4 sm:mb-8">
        <h3 className="text-xl font-semibold tracking-tight">Apoya hoy</h3>
        <p className="text-xs text-white/80">
          Cada aporte se convierte en alimento y cuidados. 💛
        </p>
      </header>

      {/* Grid SIMÉTRICO: 2 columnas en mobile para mejor tactilidad */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
        {AMOUNTS.map((cop) => (
          <WompiButton
            key={cop}
            amountCOP={cop}
            reference={referenceBase}
            className={buttonClass}
          >
            <div className="leading-tight text-center">
              <div className="text-base font-semibold">{formatCOP(cop)}</div>
              <div className="text-[11px] opacity-90">
                {SUBS[cop] ?? "¡Gracias!"}
              </div>
            </div>
          </WompiButton>
        ))}

        {/* Botón de “Otro monto” con popup */}
        <CustomAmountButton
          referenceBase={referenceBase}
          className={buttonClass}
        />
      </div>

      <div className="mt-2 mb-1 lg:mt-12">
        <SafeDonation />
      </div>
    </section>
  );
}

export default memo(DonationSection);
