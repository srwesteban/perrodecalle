import Particles from "./Particles";
import fondo from "../assets/img/dog.jpg"; 

function Background() {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
        backgroundImage: `url(${fondo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        zIndex: -1,
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
