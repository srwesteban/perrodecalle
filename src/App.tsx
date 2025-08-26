// App.tsx
import "./index.css";
import Background from "./components/Background";
import MobileIntro from "./components/MobileIntro";
import SplashScreen from "./components/SplashScreen";

import LiveVideo from "./components/LiveVideo";
import MediaFeed from "./components/MediaFeed";
import ProgressBar from "./components/ProgressBar";
import Historial from "./components/Historial";
import StatsBar from "./components/StatsBar";

import { usePreloadImages } from "./hooks/usePreloadImages";
import { useState } from "react";

// assets
import portada from "./assets/img/fondo.webp";
import perroGif from "./assets/img/PDCG.gif";
import imagenEncima from "./assets/img/imgParche.png";
import click from "./assets/img/click.gif";
import DonationSection from "./components/DonationSection";
import Informacion from "./components/Informacion";

function App() {
  const assetsReady = usePreloadImages([portada, perroGif, imagenEncima, click]);
  const [introDone, setIntroDone] = useState(false);

  // 1. Splash → hasta que carguen los assets
  if (!assetsReady) return <SplashScreen />;

  // 2. MobileIntro → bloquea hasta terminar fade
  if (!introDone) {
    return (
      <MobileIntro
        imageSrc={portada}
        gifSrc={perroGif}
        gifClick={click}
        durationMs={600}
        imagenDos={imagenEncima}
        onFinish={() => setIntroDone(true)}
      />
    );
  }

  // 3. App real
  return (
    <div
      className={[
        "relative min-h-screen",
        // 👇 Scroll SOLO en pantallas pequeñas
        "overflow-y-auto md:overflow-y-hidden",
        "overflow-x-hidden",
        // Altura 100dvh en desktop para grid perfecto
        "md:h-dvh",
      ].join(" ")}
    >
      <Background />

      <div className="relative z-10 text-white p-2 md:p-4 h-full">
        <div
          className={[
            "flex flex-col gap-2",
            "md:grid md:grid-cols-3 md:gap-3 md:h-full",
            // 👇 Filas robustas sin depender de la config del amigo
            "md:[grid-template-rows:repeat(8,minmax(0,1fr))]",
            // evita que hijos estiren el grid
            "min-h-0",
          ].join(" ")}
        >
          {/* Bloque del LiveVideo */}
          <div
            className={[
              "order-1 bg-black/40 rounded-xl p-2 w-full",
              "md:col-span-2 md:row-span-4 md:col-start-1 md:row-start-1",
              "max-h-[840px] flex flex-col h-full min-h-0 overflow-hidden",
            ].join(" ")}
          >
            {/* Barra superior fija */}
            <div className="bg-black/30 rounded-lg h-[28px] md:h-[40px] mb-2 flex items-center shrink-0 overflow-hidden">
              <StatsBar />
            </div>

            {/* Contenedor del video: crece y no recorta ni invade filas */}
            <div className="flex-1 min-h-0">
              <LiveVideo />
            </div>
          </div>

          {/* Fila extra de información (independiente) */}
          <Informacion
            className={[
              "order-2",
              "md:col-span-2 md:row-span-1 md:col-start-1 md:row-start-5",
              "min-h-0", // por si el contenido crece
            ].join(" ")}
          />

          {/* Panel Donaciones */}
          <div
            className={[
              "order-3 bg-black/40 rounded-xl p-3 min-h-[200px]",
              "md:col-start-3 md:row-start-1 md:row-span-5",
              "flex flex-col h-full min-h-0 overflow-hidden",
            ].join(" ")}
          >
            {/* Top fijo sin scroll */}
            <div className="bg-black/40 rounded-xl p-3 h-[80px] mb-2 sm:mb-10 shrink-0 overflow-hidden">
              <ProgressBar goal={1000000} />
            </div>

            {/* Scroll interno solo en esta columna */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <DonationSection />
            </div>
          </div>

          {/* Historial */}
          <div
            className={[
              "order-4 bg-black/40 rounded-xl p-3 min-h-[220px]",
              "md:col-span-3 md:row-span-3 md:col-start-2 md:row-start-6",
              "min-h-0",
            ].join(" ")}
          >
            <Historial />
          </div>

          {/* Media Feed */}
          <div
            className={[
              "order-5 bg-black/40 rounded-xl p-3",
              "md:col-span-1 md:row-span-3 md:col-start-1 md:row-start-6",
              "min-h-0",
            ].join(" ")}
          >
            <MediaFeed />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
