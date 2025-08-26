import { useEffect, useRef, useState } from "react";

type Props = {
  /** Puedes pasar la url normal de YouTube o el id. Por defecto es el video que enviaste */
  src?: string;
  title?: string;
  className?: string; // clases para el contenedor (ej: bordes, padding si quieres)
};

const DEFAULT_ID = "V1SPQGiU9q4"; // RenéZZ
const RATIO = 16 / 9;

function getYouTubeId(input?: string): string {
  if (!input) return DEFAULT_ID;
  try {
    // si es ID directo
    if (/^[\w-]{11}$/.test(input)) return input;

    const u = new URL(input);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.pathname.startsWith("/embed/")) return u.pathname.split("/").pop() || DEFAULT_ID;
    return u.searchParams.get("v") || DEFAULT_ID;
  } catch {
    return DEFAULT_ID;
  }
}

export default function YouTubeContain({
  src,
  title = "YouTube video",
  className = "",
}: Props) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // Observa el tamaño del padre y ajusta sin excederlo (contain con ratio 16:9)
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    const calc = () => {
      const cw = el.clientWidth || 0;
      const ch = el.clientHeight || 0;

      // Si el padre no define alto, usamos ratio para derivarlo desde el ancho
      if (ch === 0) {
        const w = cw;
        const h = Math.round(cw / RATIO);
        setSize({ w, h });
        return;
      }

      // Contain: ajusta para que quepa en cw x ch manteniendo 16:9
      const boxRatio = cw / ch;
      if (boxRatio > RATIO) {
        // caja más ancha que el video → limitamos por alto
        const h = ch;
        const w = Math.round(h * RATIO);
        setSize({ w, h });
      } else {
        // caja más alta que el video → limitamos por ancho
        const w = cw;
        const h = Math.round(w / RATIO);
        setSize({ w, h });
      }
    };

    const ro = new ResizeObserver(calc);
    ro.observe(el);
    calc();
    return () => ro.disconnect();
  }, []);

  const id = getYouTubeId(src);
  const embed = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;

  return (
    <div
      ref={boxRef}
      className={`relative grid place-items-center w-full h-full ${className}`}
      // Si el padre no define alto, fijamos ratio por CSS para que no crezca más
      style={{ aspectRatio: "16 / 9" }}
    >
      <iframe
        width={size.w || undefined}
        height={size.h || undefined}
        src={embed}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{
          border: 0,
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      />
    </div>
  );
}
