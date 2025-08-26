import React, { PropsWithChildren } from "react";

type Props = {
  className?: string;
  title?: string;
};

export default function Informacion({
  className = "",
  title = "Información",
  children,
}: PropsWithChildren<Props>) {
  return (
    <div
      className={`w-full h-full bg-black/40 rounded-xl p-4 text-center overflow-y-auto ${className}`}
    >
      <h3 className="text-xl font-bold mb-3 text-emerald-400 flex items-center justify-center gap-2">
        🐶 {title} 🐱
      </h3>

      {children ? (
        children
      ) : (
        <div className="space-y-3 text-sm leading-relaxed text-white/90">
          <p>
            Somos un grupo de personas comprometidas con brindar{" "}
            <span className="font-semibold text-emerald-300">
              alimento, refugio y cuidados médicos
            </span>{" "}
            a los animales en situación de calle. 💛
          </p>
          <p>
            No buscamos enriquecernos con el mal ajeno. Cada aporte se usa de
            manera{" "}
            <span className="font-semibold text-emerald-300">
              transparente y responsable
            </span>
            , y puedes confiar en que tu ayuda se transforma directamente en
            bienestar para ellos.
          </p>
          <p>
            Con tu apoyo logramos que más perros y gatos tengan{" "}
            <span className="font-semibold text-emerald-300">
              una segunda oportunidad
            </span>
            . 🐾✨
          </p>
          <p className="font-semibold text-emerald-400">
            Tu confianza es nuestra fuerza, y tu ayuda hace la diferencia. 🙌
          </p>
        </div>
      )}
    </div>
  );
}
