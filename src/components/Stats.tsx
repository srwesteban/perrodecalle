import { useEffect, useState } from "react";
import VisitsCounter from "../streaming/userViewers/components/VisitsCounter";

function Stats() {
  const [visitas, setVisitas] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data?.rows) {
          const total = data.rows.reduce(
            (acc: number, row: any) => acc + parseInt(row.metricValues[0].value, 10),
            0
          );
          setVisitas(total);
        }
      });
  }, []);

  return (
    <div className="text-white text-2xl font-bold flex items-center gap-4">
      <img
        src="https://css.mintic.gov.co/mt/mintic/new/img/logo_mintic_24_dark.svg"
        alt="Logo MinTIC"
        className="h-10 w-auto shrink-0"
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      <div>
        <VisitsCounter />
        {visitas !== null && <p className="text-base font-normal">Total visitas: {visitas}</p>}
      </div>
    </div>
  );
}

export default Stats;
