import { useEffect, useState } from "react";
import VisitsCounter from "./VisitsCounter";

function Stats() {
  const [visitas, setVisitas] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data?.rows) {
          const total = data.rows.reduce(
            (acc: number, row: any) =>
              acc + parseInt(row.metricValues[0].value, 10),
            0
          );
          setVisitas(total);
        }
      });
  }, []);

  return (
    <div className="text-white text-2xl font-bold">
      <VisitsCounter />
    </div>
  );
}

export default Stats;
