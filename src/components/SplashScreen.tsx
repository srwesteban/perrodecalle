// src/components/SplashScreen.tsx
export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white">
      <p className="animate-pulse">Cargando…</p>
    </div>
  );
}
