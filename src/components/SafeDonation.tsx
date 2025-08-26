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
        "max-h-[230px] overflow-hidden", // 👈 evita que se pase del padre
        className,
      ].join(" ")}
    >
      {/* Icono (GIF) contenido, no fuerza altura */}
      <div className="shrink-0 max-w-[64px] max-h-[64px]">
        <img
          src={gifSrc}
          alt="Donación segura"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Texto fluido */}
      <div className="leading-snug overflow-hidden">
        <h4 className="text-sm sm:text-base font-semibold">Donación segura</h4>
        <p className="mt-1 text-sm xl:text-base text-white/80">
          Tu donación es 100% segura y se transforma en alimento, rescates y cuidados
          veterinarios para <b>perritos en situación de calle</b>. Pagos procesados por Wompi.
        </p>
      </div>
    </div>
  );
};

export default SafeDonation;
