import { useEffect, useRef, useState } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";

type Props = {
  active: boolean;
  durationMs?: number;      // default 5000
  onDone?: () => void;
};

type ConfettiFn = (opts: any) => void;

export default function ConfettiController({ active, durationMs = 5000, onDone }: Props) {
  const confettiRef = useRef<ConfettiFn | null>(null);
  const [showMsg, setShowMsg] = useState(false);
  const [ready, setReady] = useState(false);

  const handleInit = (params: any) => {
    confettiRef.current = params?.confetti ?? null;
    setReady(true); // ✅ marcar que ya está listo
  };

  useEffect(() => {
    if (!active || !ready || !confettiRef.current) return;

    setShowMsg(true);

    const end = Date.now() + durationMs;
    let raf = 0;

    const frame = () => {
      confettiRef.current?.({
        particleCount: 18,
        spread: 360,
        startVelocity: 40,
        ticks: 200,
        origin: { x: Math.random(), y: Math.random() - 0.15 },
      });
      if (Date.now() < end) {
        raf = requestAnimationFrame(frame);
      } else {
        setShowMsg(false);
        onDone?.();
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, ready, durationMs, onDone]); // 👈 se vuelve a correr cuando está listo

  return (
    <>
      <ReactCanvasConfetti
        onInit={handleInit as any}
        className="pointer-events-none fixed inset-0 w-full h-full z-[9999]"
      />
      {showMsg && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <h1 className="text-center px-6 text-3xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)] animate-bounce">
            💖 Gracias por tu donación 💖
          </h1>
        </div>
      )}
    </>
  );
}
