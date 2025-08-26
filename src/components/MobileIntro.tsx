// src/components/MobileIntro.tsx
import { useEffect, useMemo, useState } from "react";

type MobileIntroProps = {
  imageSrc: string;
  gifSrc?: string;
  imagenDos?: string;
  gifClick?: string;

  durationMs?: number;

  gifAlt?: string;
  imagenDosAlt?: string;
  gifClickAlt?: string;

  gifBlendMode?: "multiply" | "screen" | "normal";
  gifSizeClass?: string;

  topContainerClass?: string;
  bottomContainerClass?: string;

  topMaxHeightClass?: string;
  bottomMaxHeightClass?: string;

  clickSizeClass?: string;
  clickPersist?: boolean;

  onFinish?: () => void;
};

export default function MobileIntro({
  imageSrc,
  gifSrc,
  imagenDos,
  gifClick,

  durationMs = 600,

  gifAlt = "Intro animada",
  imagenDosAlt = "Imagen inferior",
  gifClickAlt = "Toca aquí",

  gifBlendMode = "multiply",
  gifSizeClass = "w-full h-auto",

  topContainerClass = "",
  bottomContainerClass = "",

  topMaxHeightClass = "max-h-[44svh]",
  bottomMaxHeightClass = "max-h-[40svh]",

  clickSizeClass = "w-48 h-48 md:w-56 md:h-56",
  clickPersist = false,

  onFinish,
}: MobileIntroProps) {
  // --- Detecta mobile desde el primer render (SPA) ---
  const getIsMobile = () =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767.98px)").matches
      : true; // fallback móvil si no hay window (no SSR en Vite)

  const [isMobile, setIsMobile] = useState<boolean>(getIsMobile);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767.98px)");
    const apply = () => setIsMobile(mq.matches);
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Si NO es mobile, avisa al padre y no montes nada
  useEffect(() => {
    if (!isMobile) {
      // asegura que la App avance al contenido real
      onFinish?.();
    }
  }, [isMobile, onFinish]);

  if (!isMobile) return null;

  // --- Lógica del intro (solo en mobile) ---
  const [mode, setMode] = useState<"idle" | "tap">("idle");
  const [mounted, setMounted] = useState(true);

  const effectiveDuration = useMemo(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return 0;
    }
    return durationMs;
  }, [durationMs]);

  // Un solo listener para cualquier interacción
  useEffect(() => {
    if (!mounted) return;
    const triggerFade = () => setMode("tap");
    window.addEventListener("pointerdown", triggerFade, { passive: true, once: true });
    return () => window.removeEventListener("pointerdown", triggerFade);
  }, [mounted]);

  // Desmonta al terminar y avisa al padre
  useEffect(() => {
    if (mode === "idle") return;
    if (effectiveDuration === 0) {
      setMounted(false);
      onFinish?.();
      return;
    }
    const timer = setTimeout(() => {
      setMounted(false);
      onFinish?.();
    }, effectiveDuration);
    return () => clearTimeout(timer);
  }, [mode, effectiveDuration, onFinish]);

  if (!mounted) return null;

  const anim = mode === "tap" ? "opacity-0" : "opacity-100";

  const blendClass =
    gifBlendMode === "multiply"
      ? "mix-blend-multiply"
      : gifBlendMode === "screen"
      ? "mix-blend-screen"
      : "mix-blend-normal";

  return (
    <div
      className={`fixed inset-0 z-[60] pointer-events-none isolate transition-opacity will-change-[opacity,transform] ${anim}`}
      style={{ transitionDuration: `${effectiveDuration}ms` }}
      aria-hidden
    >
      {/* Fondo portada optimizado */}
      <img
        src={imageSrc}
        alt="Portada"
        decoding="async"
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Sombra sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />

      {/* GIF central */}
      {gifClick && (
        <img
          src={gifClick}
          alt={gifClickAlt}
          decoding="async"
          loading="eager"
          className={[
            "pointer-events-none",
            "absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2",
            clickSizeClass,
            "object-contain transition-all",
            clickPersist
              ? "opacity-100 scale-100"
              : mode === "idle"
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95",
          ].join(" ")}
          style={{ zIndex: 1, transitionDuration: `${effectiveDuration}ms` }}
        />
      )}

      {/* Contenido arriba y abajo */}
      <div
        className="absolute inset-0 flex flex-col justify-between"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 16px)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
        }}
      >
        {gifSrc && (
          <div className={`pointer-events-none px-4 ${topContainerClass}`}>
            <img
              src={gifSrc}
              alt={gifAlt}
              decoding="async"
              loading="lazy"
              className={[
                "mx-auto w-[min(92vw,600px)]",
                topMaxHeightClass,
                "object-contain transition-all",
                mode === "idle" ? "opacity-100 scale-100" : "opacity-0 scale-95",
                blendClass,
                gifSizeClass,
              ].join(" ")}
              style={{ transitionDuration: `${effectiveDuration}ms` }}
            />
          </div>
        )}

        {imagenDos && (
          <div className={`pointer-events-none px-4 ${bottomContainerClass}`}>
            <img
              src={imagenDos}
              alt={imagenDosAlt}
              decoding="async"
              loading="lazy"
              className={[
                "mx-auto w-[min(92vw,600px)]",
                bottomMaxHeightClass,
                "object-contain transition-all",
                mode === "idle" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
              ].join(" ")}
              style={{ transitionDuration: `${effectiveDuration}ms` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
