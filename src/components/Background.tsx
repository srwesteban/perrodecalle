// Background.tsx
import { useEffect, useState, useMemo } from "react";
import Particles from "./Particles";

function Background() {
  // Respeta "Reduce Motion" del sistema y evita animaciones si está activo
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReducedMotion(mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Solo mostrar partículas en >= md para ahorrar en móviles
  const isMdUp = useMemo(() => {
    if (typeof window === "undefined") return false;
    // tailwind md por defecto ~768px
    return window.innerWidth >= 768;
  }, []);

  // Ajustes más livianos de partículas
  const particleProps = useMemo(
    () => ({
      particleColors: ["#ffffff", "#ffffff"],
      particleCount: reducedMotion ? 0 : 120, // menos partículas
      particleSpread: 8,
      speed: reducedMotion ? 0 : 0.08,        // un poco más lento
      particleBaseSize: 80,                    // menos sprites grandes
      moveParticlesOnHover: false,             // sin costos de hover
      alphaParticles: false,
      disableRotation: true,                   // rotación off = menos cálculo
    }),
    [reducedMotion]
  );

  return (
    <div className="fixed inset-0 -z-10">
      {/* Fondo con degradado (sin imagen) */}
      <div className="w-full h-full bg-gradient-to-b from-[#0a192f] via-[#0d1b2a] to-[#000814]" />

      {/* Capa de partículas (solo desktop y si no hay reduce-motion) */}
      {isMdUp && !reducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          <Particles {...particleProps} />
        </div>
      )}
    </div>
  );
}

export default Background;
