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

function App() {
  const assetsReady = usePreloadImages([
    portada,
    perroGif,
    imagenEncima,
    click,
  ]);
  const [introDone, setIntroDone] = useState(false);

  // 1. Splash → hasta que carguen los assets
  if (!assetsReady) {
    return <SplashScreen />;
  }

  // 2. MobileIntro → bloquea hasta terminar fade
  if (!introDone) {
    return (
      <MobileIntro
        imageSrc={portada}
        gifSrc={perroGif}
        gifClick={click}
        durationMs={600}
        imagenDos={imagenEncima}
        onFinish={() => setIntroDone(true)} // 👈 notificamos cuando termina
      />
    );
  }

  // 3. App real
  return (
    <div className="relative min-h-screen md:h-dvh md:overflow-hidden overflow-x-hidden">
      <Background />

      <div className="relative z-10 text-white p-2 md:p-4 h-full">
        {/* GRID DE 5×5 */}
        <div className="grid grid-cols-5 grid-rows-5 gap-3 h-full">
          {/* 🟢 LiveVideo + Stats + Info */}
          <div className="col-span-3 row-span-3 bg-black/40 rounded-xl p-2">
            <div className="bg-black/30 rounded-lg h-[28px] md:h-[40px] mb-2 flex items-center">
              <StatsBar />
            </div>

            {/* ❌ quité el aspect-video aquí */}
            <LiveVideo />

            <div className="mt-2 bg-black/30 rounded-xl p-3 text-center">
              Información...
            </div>
          </div>

          {/* 🟢 Donaciones */}
          <div className="col-span-2 row-span-3 col-start-4 bg-black/40 rounded-xl p-3">
            <div className="bg-black/40 rounded-xl p-3 h-[80px] mb-2 sm:mb-10">
              <ProgressBar goal={1000000} />
            </div>
            <DonationSection />
          </div>

          {/* 🟢 Historial */}
          <div className="col-span-2 row-span-2 col-start-4 row-start-4 bg-black/40 rounded-xl p-3">
            <Historial />
          </div>

          {/* 🟢 Media Feed */}
          <div className="col-span-3 row-span-2 col-start-1 row-start-4 bg-black/40 rounded-xl p-3">
            <MediaFeed />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
