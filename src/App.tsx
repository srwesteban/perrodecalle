// src/App.tsx
import "./index.css";
import Background from "./components/Background";
import MobileIntro from "./components/MobileIntro";
import SplashScreen from "./components/SplashScreen";
import LiveVideo from "./components/LiveVideo";
import MediaFeed from "./components/MediaFeed";
import ProgressBar from "./components/ProgressBar";
import Historial from "./components/Historial";
import StatsBar from "./components/StatsBar";
import DonationSection from "./components/DonationSection";
import Informacion from "./components/Informacion";
import ConfettiController from "./components/ConfettiController";

import { usePreloadImages } from "./hooks/usePreloadImages";
import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabase";

// assets
import portada from "./assets/img/fondo.webp";
import perroGif from "./assets/img/PDCG.gif";
import imagenEncima from "./assets/img/imgParche.png";
import click from "./assets/img/click.gif";
import Wompi from "./streaming/paymentGateway/components/Wompi";
import CircularGallery from "./components/CircularGallery";
import NequiSimulado from "./streaming/paymentGateway/components/NequiSimulado";
import WompiTestButton from "./components/WompiTestButton";

function App() {
  const assetsReady = usePreloadImages([
    portada,
    perroGif,
    imagenEncima,
    click,
  ]);
  const [introDone, setIntroDone] = useState(false);

  // ✅ Estado para encender/apagar confeti
  const [confettiOn, setConfettiOn] = useState(false);

  // Para evitar duplicados
  const celebrated = useRef<Set<string>>(new Set());

  useEffect(() => {
    const channel = supabase
      .channel("donations-status")
      // Cuando insertan una donación nueva
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "donations" },
        (payload: any) => {
          const row = payload.new;
          if (!row) return;
          if (row.status === "APPROVED" && !celebrated.current.has(row.id)) {
            celebrated.current.add(row.id);
            setConfettiOn(true);
          }
        }
      )
      // Cuando actualizan una donación existente
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "donations" },
        (payload: any) => {
          const row = payload.new;
          const prev = payload.old;
          if (!row) return;

          const justApproved =
            row.status === "APPROVED" &&
            (prev
              ? prev.status !== "APPROVED"
              : !celebrated.current.has(row.id));

          if (justApproved && !celebrated.current.has(row.id)) {
            celebrated.current.add(row.id);
            setConfettiOn(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Splash hasta que carguen assets
  if (!assetsReady) return <SplashScreen />;

  // Intro móvil
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

  // App real
  return (
    <div
      className={[
        "relative min-h-screen",
        "overflow-y-auto md:overflow-y-hidden",
        "overflow-x-hidden",
        "md:h-dvh",
      ].join(" ")}
    >
      <Background />

      {/* 🎊 Confeti a pantalla completa */}
      <ConfettiController
        active={confettiOn}
        durationMs={5000}
        onDone={() => setConfettiOn(false)}
      />

      <div className="relative z-10 text-white p-2 md:p-4 h-full">
        <div
          className={[
            "flex flex-col gap-2",
            "md:grid md:grid-cols-3 md:gap-3 md:h-full",
            "md:[grid-template-rows:repeat(8,minmax(0,1fr))]",
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

            {/* Contenedor del video */}
            <div className="flex-1 min-h-0">
              <LiveVideo src="https://www.youtube.com/watch?v=XIFr42RPPLA&list=RDXIFr42RPPLA" />
            </div>
          </div>

          {/* Fila extra de información */}
          <Informacion
            className={[
              "order-2",
              "md:col-span-2 md:row-span-1 md:col-start-1 md:row-start-5",
              "min-h-0",
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
            {/* Barra progreso */}
            <div className="bg-black/40 rounded-xl p-3 h-[80px] sm:mb-2 shrink-0 overflow-hidden">
              <ProgressBar goal={1000000} />
            </div>

            {/* Scroll interno */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <DonationSection />
              {/* <Wompi/> */}
            </div>
          </div>

          {/* Historial */}
          <div
            className={[
              "order-5 bg-black/40 rounded-xl p-3 min-h-[220px]",
              "md:col-span-3 md:row-span-3 md:col-start-3 md:row-start-6",
              "min-h-0",
            ].join(" ")}
          >
            {/* <Historial /> */}
            <WompiTestButton amountCOP={10000} referenceBase="don-test" />

          </div>

          {/* Media Feed */}

          <div
            className={[
              "order-4 bg-black/40 rounded-xl p-3",
              "md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-6",
              "min-h-0 flex flex-col",
            ].join(" ")}
          >
            <p className="text-sm sm:text-base text-center font-semibold leading-none mt-2">
              Dogs 🐶
            </p>
            <CircularGallery bend={0} borderRadius={0.05} scrollEase={0.02} />
            <NequiSimulado/>
          </div>

          {/* Social */}

          <div
            className="order-6 bg-black/40 rounded-xl p-4 flex flex-col gap-4
             md:col-span-2 md:row-span-1 md:col-start-1 md:row-start-8"
          >
            <MediaFeed />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
