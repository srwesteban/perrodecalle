import './index.css';
import Background from './components/Background';
import Overlay from './components/Overlay';
import Stats from './components/Stats';
import LiveVideo from './components/LiveVideo';
import Wompi from './streaming/paymentGateway/components/Wompi';
import MediaFeed from './components/MediaFeed';
import ProgressBar from './components/ProgressBar';
import Historial from './components/Historial';
import NequiSimulado from './streaming/paymentGateway/components/NequiSimulado';
import DonateWithBold from './components/DonateWithBold';


function App() {
  return (
    <div className="relative min-h-screen">
      {/* Fondo */}
      <Background />

      {/* Contenido principal */}
      <div className="relative z-10 p-4 space-y-4 text-white">

        {/* Fila 1 - Stats */}
        <section className="border-2 border-red-500 p-4 w-full">
          <Stats/>
        </section>

        {/* Fila 2 */}
        <div className="flex flex-col md:flex-row gap-4">

          {/* LiveVideo - 60% izquierda */}
          <section className="border-2 border-red-500 p-4 flex-1 md:w-3/5">
            <LiveVideo />
          </section>

          {/* Barra de progreso + Donaciones */}
          <section className="border-2 border-red-500 p-4 flex-1 md:w-2/5">
            <div className="flex flex-col gap-4">

              {/* ProgressBar */}
              <div className="border-2 border-red-500 p-2">
                <ProgressBar goal={1000000} />
              </div>

              {/* Subfila 2: Wompi + Nequi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-red-500 p-2">
                  <Wompi />
                </div>
                <div className="border-2 border-red-500 p-2">
                  <NequiSimulado />
                </div>
                <div className="border-2 border-red-500 p-2">
                  <DonateWithBold/>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Fila 3 */}
        <div className="flex flex-col md:flex-row gap-4">

          {/* MediaFeed */}
          <section className="border-2 border-red-500 p-4 flex-1">
            <MediaFeed />
          </section>

          {/* Historial */}
          <section className="border-2 border-red-500 p-4 flex-1">
            <Historial />
          </section>
        </div>
      </div>

      {/* Overlay */}
      <Overlay />
    </div>
  );
}

export default App;
