import "./index.css";
import Background from "./components/Background";
import Overlay from "./components/Overlay";
import Stats from "./components/Stats";
import LiveVideo from "./components/LiveVideo";
import Wompi from "./streaming/paymentGateway/components/Wompi";
import MediaFeed from "./components/MediaFeed";
import ProgressBar from "./components/ProgressBar";
import Historial from "./components/Historial";
import FeedGrid from "./components/FeedGrid";

function App() {
  return (
    // 📱 mobile: scroll; 💻 desktop: pantalla completa sin scroll
    <div className="relative min-h-screen md:h-dvh md:overflow-hidden">
      <Background />

      <div className="relative z-10 text-white p-2 md:p-4 h-full">
        {/* 📱 mobile -> stack con orden; 💻 desktop -> grid fija */}
        <div className="flex flex-col gap-2 md:grid md:grid-cols-4 md:grid-rows-8 md:gap-3 md:h-full">
          {/* 1) STATS — más bajito en mobile */}
          <div className="
              order-1 bg-black/40 rounded-xl p-3
              min-h-[46px]  /* móvil corto */
              md:order-none md:col-span-2 md:h-full md:overflow-hidden
            ">
            <Stats />
          </div>

          {/* 2) LIVE VIDEO — siempre completo (aspect-video) en móvil */}
          <div className="
              order-2 bg-black/40 rounded-xl p-2
              aspect-video  /* ocupa ancho y respeta 16:9 */
              md:order-none md:p-4 md:col-span-2 md:row-span-4 md:col-start-1 md:row-start-2 md:h-full md:aspect-auto md:overflow-hidden
            ">
            <div className="h-full w-full">
              <LiveVideo />
            </div>
          </div>

          {/* 3) PROGRESS BAR — tercero en mobile */}
          <div className="
              order-3 bg-black/40 rounded-xl p-3
              md:order-none md:col-span-2 md:col-start-3 md:row-start-1 md:h-full md:overflow-hidden
            ">
            <ProgressBar goal={1000000} />
          </div>

          {/* 4) WOMPI — “doble de alto”; igual que FeedGrid */}
          <div className="
              order-4 bg-black/40 rounded-xl p-3
              min-h-[200px]  /* alto móvil */
              md:order-none md:p-4 md:row-span-4 md:col-start-4 md:row-start-2 md:h-full md:overflow-auto
            ">
            <Wompi />
          </div>

          {/* 5) FEEDGRID — mismo alto que Wompi */}
          <div className="
              order-5 bg-black/40 rounded-xl p-3
              min-h-[200px]
              md:order-none md:p-4 md:row-span-4 md:col-start-3 md:row-start-2 md:h-full md:overflow-auto
            ">
            <FeedGrid />
          </div>

          {/* 6) HISTORIAL — mismo alto que arriba */}
          <div className="
              order-6 bg-black/40 rounded-xl p-3
              min-h-[220px]
              md:order-none md:p-4 md:col-span-2 md:row-span-3 md:col-start-3 md:row-start-6 md:h-full md:overflow-auto
            ">
            <Historial />
          </div>

          {/* 7) MEDIAFEED — se extiende según contenido en móvil */}
          <div className="
              order-7 bg-black/40 rounded-xl p-3
              md:order-none md:p-4 md:col-span-2 md:row-span-3 md:col-start-1 md:row-start-6 md:h-full md:overflow-auto
            ">
            <MediaFeed />
          </div>
        </div>
      </div>

      <Overlay />
    </div>
  );
}

export default App;
