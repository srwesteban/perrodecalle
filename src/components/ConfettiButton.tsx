// ConfettiButton.tsx
import { useRef, useCallback, useState } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";

type ConfettiFn = (opts: any) => void;

export default function ConfettiButton() {
  const confettiRef = useRef<ConfettiFn | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  const handleInit = useCallback((params: any) => {
    confettiRef.current = params?.confetti ?? null;
  }, []);

  const fire = useCallback(() => {
    if (!confettiRef.current) return;

    setShowMessage(true); // mostrar mensaje

    const duration = 5000; // 5 segundos
    const end = Date.now() + duration;

    (function frame() {
      confettiRef.current?.({
        particleCount: 15,
        spread: 360,
        startVelocity: 40,
        ticks: 200,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // ocultar mensaje después del tiempo
    setTimeout(() => setShowMessage(false), duration);
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      <ReactCanvasConfetti
        onInit={handleInit as any}
        className="pointer-events-none fixed inset-0 w-full h-full z-50"
      />

      {/* Botón */}
      <button
        onClick={fire}
        className="z-10 rounded-xl bg-green-600 px-6 py-3 text-white shadow-md hover:bg-green-700"
      >
        🎊 Donar (test confeti)
      </button>

      {/* Mensaje centrado */}
      {showMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg animate-bounce text-center px-4">
            💖 Gracias por tu donación 💖
          </h1>
        </div>
      )}
    </div>
  );
}
