import { useEffect, useState } from "react";

function VisitsCounter() {
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        setVisits(Number(data.visits));
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="text-white text-xl font-bold">
      👀 G: {visits !== null ? visits : "Cargando..."}
    </div>
  );
}

export default VisitsCounter;
