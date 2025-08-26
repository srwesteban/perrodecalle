// App.tsx
import "./index.css";
import Background from "./components/Background";
import MobileIntro from "./components/MobileIntro";
import SplashScreen from "./components/SplashScreen";

import LiveVideo from "./components/LiveVideo";
import Wompi from "./streaming/paymentGateway/components/Wompi";
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
        <div className="flex flex-col gap-2 md:grid md:grid-cols-4 md:grid-rows-8 md:gap-3 md:h-full">
          <div className="order-1 bg-black/30 rounded-lg h-[28px] md:h-[28px] flex items-center md:col-span-2">
            <StatsBar />
          </div>

          <div className="order-2 bg-black/40 rounded-xl p-2 aspect-video md:col-span-2 md:row-span-4 md:col-start-1 md:row-start-2">
            <LiveVideo />
          </div>

          <div className="order-3 bg-black/40 rounded-xl p-3 md:col-span-2 md:col-start-3 md:row-start-1">
            <ProgressBar goal={1000000} />
          </div>

          <div className="order-4 bg-black/40 rounded-xl p-3 min-h-[200px] md:col-start-4 md:row-start-2 md:row-span-4">
            <DonationSection />
          </div>

          <div className="order-6 bg-black/40 rounded-xl p-3 min-h-[220px] md:col-span-2 md:row-span-3 md:col-start-3 md:row-start-6">
            <Historial />
          </div>

          <div className="order-7 bg-black/40 rounded-xl p-3 md:col-span-2 md:row-span-3 md:col-start-1 md:row-start-6">
            <MediaFeed />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
