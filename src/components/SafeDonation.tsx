// src/components/SafeDonation.tsx
import { FC } from "react";
import safeGif from "../assets/img/Safe.gif"; // ajusta la ruta si tu estructura difiere

type Props = {
  gifSrc?: string;
  className?: string;
};

const SafeDonation: FC<Props> = ({ gifSrc = safeGif, className = "" }) => {
  return (
    <div
      className={[
        "rounded-xl border border-white/10 bg-white/5",
        "p-3 sm:p-4 text-white",
        "flex items-start gap-3 sm:gap-4",
        className,
      ].join(" ")}
    >
      {/* Icono (GIF) un poco más pequeño, sin distorsión y sin encoger */}
      <div className="shrink-0 w-20 h-20">
        <img src={gifSrc} alt="Donación segura" className="w-full h-full object-contain" />
      </div>

      {/* Texto con mejor jerarquía y lectura */}
      <div className="leading-snug">
        <h4 className="text-sm sm:text-base font-semibold">Donación segura</h4>
        <p className="mt-1 text-[13px] sm:text-sm text-white/80">
          Tu donación es 100% segura y se transforma en alimento, rescates y cuidados
          veterinarios para <b>perritos en situación de calle</b>. Pagos procesados por Wompi.
        </p>
      </div>
    </div>
  );
};

export default SafeDonation;
