// src/components/Splash.tsx
import { useEffect, useState, useCallback } from "react";

export default function Splash() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("splashSeen");
    if (!seen) {
      setOpen(true);
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  const close = useCallback(() => {
    if (!open) return;
    setOpen(false);
    sessionStorage.setItem("splashSeen", "1");
    document.documentElement.style.overflow = "";
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); close(); };
    const onTouch = (e: TouchEvent) => { close(); };
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", " ", "Escape"].includes(e.key)) close();
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#000",
        // Fading
        animation:
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "none"
            : "splash-in 220ms ease-out",
      }}
    >
      {/* Imagen responsiva con srcset (AVIF/WebP/JPEG) */}
      <picture>
        <source
          type="image/avif"
          srcSet={[
            "/splash/splash-720x1560.avif 720w",
            "/splash/splash-1080x2340.avif 1080w",
            "/splash/splash-1440x3120.avif 1440w",
          ].join(", ")}
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcSet={[
            "/splash/splash-720x1560.webp 720w",
            "/splash/splash-1080x2340.webp 1080w",
            "/splash/splash-1440x3120.webp 1440w",
          ].join(", ")}
          sizes="100vw"
        />
        <img
          src="/splash/splash-1080x2340.jpg"
          alt="Bienvenido"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            userSelect: "none",
            pointerEvents: "none",
          }}
          loading="eager"
          fetchPriority="high"
        />
      </picture>

      {/* Botón/Hint (opcional, muy sutil) */}
      <div
        style={{
          position: "absolute",
          insetInline: 0,
          bottom: "env(safe-area-inset-bottom, 16px)",
          textAlign: "center",
          color: "rgba(255,255,255,.9)",
          fontSize: 12,
          letterSpacing: .2,
          textShadow: "0 1px 2px rgba(0,0,0,.5)",
          pointerEvents: "none",
        }}
      >
        toca o desplaza para entrar
      </div>

      <style>{`
        @keyframes splash-in {
          from { opacity: 0; } to { opacity: 1; }
        }
        .fade-out { animation: splash-out .25s ease-in forwards; }
        @keyframes splash-out {
          to { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </div>
  );
}
