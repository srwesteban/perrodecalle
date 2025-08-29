// LiveVideo.tsx
import React from "react";
import YouTubeContain from "./YouTubeContain";

const LOGO_URL =
  "https://css.mintic.gov.co/mt/mintic/new/img/logo_mintic_24_dark.svg";

type LiveVideoProps = {
  src?: string; // pasa aquí la URL/ID para cambiar rápido de video
};

export default function LiveVideo({ src }: LiveVideoProps) {
  const [bgUrl, setBgUrl] = React.useState<string | null>(null);

  // Cada vez que cambia el video, ocultamos el fondo.
  React.useEffect(() => {
    setBgUrl(null);
  }, [src]);

  // Cuando el iframe esté listo, precargamos el logo y luego lo mostramos.
  const handlePlayerReady = React.useCallback(() => {
    // Difíere el trabajo para no competir con el render del player
    const defer = (cb: () => void) =>
      typeof (window as any).requestIdleCallback === "function"
        ? (window as any).requestIdleCallback(cb, { timeout: 1500 })
        : setTimeout(cb, 200);

    defer(() => {
      const img = new Image();
      img.src = LOGO_URL;
      img.onload = () => setBgUrl(LOGO_URL);
      // si falla, simplemente no ponemos fondo
    });
  }, []);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-900">
      {/* Capa patrón: se muestra SOLO cuando el video ya está listo */}
      <div
        aria-hidden
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          bgUrl ? "opacity-10" : "opacity-0"
        }`}
        style={
          bgUrl
            ? {
                backgroundImage: `url('${bgUrl}')`,
                backgroundRepeat: "repeat",
                backgroundSize: "120px 120px",
                backgroundPosition: "center",
              }
            : undefined
        }
      />
      {/* Degradado suave para contraste */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none bg-gradient-to-br from-black/30 via-transparent to-black/40"
      />

      {/* Contenido */}
      <div className="relative w-full h-full">
        {/* Mobile: ratio por ancho (siempre visible) */}
        <div className="block md:hidden w-full aspect-video">
          <YouTubeContain className="w-full h-full" src={src} onReady={handlePlayerReady} />
        </div>

        {/* Desktop: se ajusta a la altura del slot del grid */}
        <div className="hidden md:flex items-center justify-center h-full">
          <div className="h-full aspect-video">
            <YouTubeContain className="w-full h-full" src={src} onReady={handlePlayerReady} />
          </div>
        </div>
      </div>
    </div>
  );
}
