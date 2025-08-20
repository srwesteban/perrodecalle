import Particles from "./Particles";
import fondo from "../assets/img/dog.jpg"; // 👈 importa la imagen

function Background() {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh", // 👈 ahora ocupa toda la pantalla
        position: "absolute",
        top: 0,
        left: 0,
        backgroundImage: `url(${fondo})`, // 👈 corregido
        backgroundSize: "cover",          // ajusta la imagen al tamaño de la pantalla
        backgroundPosition: "center",     // centra la imagen
        backgroundRepeat: "no-repeat",
        zIndex: -1, // para que quede detrás
      }}
    >
      <Particles
        particleColors={["#ffffff", "#ffffff"]}
        particleCount={200}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={100}
        moveParticlesOnHover={true}
        alphaParticles={false}
        disableRotation={false}
      />
    </div>
  );
}

export default Background;
