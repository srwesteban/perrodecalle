import "./index.css";
import Background from "./components/Background";
import MobileIntro from "./components/MobileIntro"; // 👈 nuestro overlay móvil
import LiveVideo from "./components/LiveVideo";
import Wompi from "./streaming/paymentGateway/components/Wompi";
import MediaFeed from "./components/MediaFeed";
import ProgressBar from "./components/ProgressBar";
import Historial from "./components/Historial";
import StatsBar from "./components/StatsBar";

// 👇 importa los archivos (Vite los resuelve a URLs con hash)
import portada from "./assets/img/fondo.webp";
import perroGif from "./assets/img/PDCG.gif";
import imagenEncima from "./assets/img/imgParche.png";
import click from "./assets/img/click.gif";

function App() {
  return (
    <div className="relative min-h-screen md:h-dvh md:overflow-hidden overflow-x-hidden">
      {/* Portada SOLO en móvil:
          - tap/click => fade
          - scroll    => slide up */}
      <MobileIntro
        imageSrc={portada}
        gifSrc={perroGif}
        gifClick={click}
        durationMs={600}
        imagenDos={imagenEncima}
      />

      <Background />

      <div className="relative z-10 text-white p-2 md:p-4 h-full">
        <div className="flex flex-col gap-2 md:grid md:grid-cols-4 md:grid-rows-8 md:gap-3 md:h-full">
          <div className="order-1 bg-black/30 rounded-lg h-[28px] md:h-[28px] p-0 md:p-0 md:order-none md:col-span-2 flex items-center" style={{ lineHeight: 1 }}>
            <StatsBar />
          </div>

          <div className="order-2 bg-black/40 rounded-xl p-2 overflow-hidden aspect-video md:order-none md:p-4 md:col-span-2 md:row-span-4 md:col-start-1 md:row-start-2 md:h-full md:aspect-auto md:overflow-hidden">
            <div className="h-full w-full">
              <LiveVideo />
            </div>
          </div>

          <div className="order-3 bg-black/40 rounded-xl p-3 md:order-none md:col-span-2 md:col-start-3 md:row-start-1 md:h-full md:overflow-hidden">
            <ProgressBar goal={1000000} />
          </div>

          <div className="order-4 bg-black/40 rounded-xl p-3 min-h-[200px] md:order-none md:p-4 md:row-span-4 md:col-start-4 md:row-start-2 md:h-full md:overflow-auto">
            <Wompi />
          </div>

          <div className="order-6 bg-black/40 rounded-xl p-3 min-h-[220px] md:order-none md:p-4 md:col-span-2 md:row-span-3 md:col-start-3 md:row-start-6 md:h-full md:overflow-auto">
            <Historial />
          </div>

          <div className="order-7 bg-black/40 rounded-xl p-3 md:order-none md:p-4 md:col-span-2 md:row-span-3 md:col-start-1 md:row-start-6 md:h-full md:overflow-auto">
            <MediaFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
