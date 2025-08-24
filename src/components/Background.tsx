import Particles from "./Particles";
import fondo from "../assets/img/dog.jpg";

function Background() {
  return (
    // Contenedor fijo a pantalla completa
    <div className="fixed inset-0 -z-10">
      {/* Capa de fondo */}
      {/* Mobile: degradado */}
      <div className="block md:hidden w-full h-full bg-gradient-to-b from-[#0a192f] via-[#0d1b2a] to-[#000814]" />

      {/* Desktop: imagen */}
      <div
        className="hidden md:block w-full h-full"
        style={{
          backgroundImage: `url(${fondo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Capa de partículas SIEMPRE activa */}
      <div className="absolute inset-0">
        <Particles
          particleColors={["#ffffff", "#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
          // si las partículas te bloquean clics, descomenta:
          // className="pointer-events-none"
        />
      </div>
    </div>
  );
}

export default Background;
