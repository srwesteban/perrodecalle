import { useEffect } from "react";
import confetti from "canvas-confetti";

type Props = {
  active: boolean;
  durationMs?: number;
  onDone?: () => void;
};

export default function ConfettiController({
  active,
  durationMs = 3000,
  onDone,
}: Props) {
  useEffect(() => {
    if (!active) return;

    const animationEnd = Date.now() + durationMs;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        onDone?.();
        return;
      }

      const particleCount = 50 * (timeLeft / durationMs);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, [active, durationMs, onDone]);

  return null; // no pinta nada, solo dispara confetti
}
