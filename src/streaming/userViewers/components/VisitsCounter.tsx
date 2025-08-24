import { useActiveUsers } from "../hooks/useActiveUsers";
import { useGetViewersApp } from "../hooks/useGetViwersApp";

function VisitsCounter() {
  const activeUsers = useActiveUsers();
  const getViwersApp = useGetViewersApp();

  return (
    <aside style={{ fontSize: 18, opacity: 0.7, marginTop: 8, flexDirection: "column", display: "flex", gap: 4 }}>
      <span>{getViwersApp} visitantes totales en mi app</span>
      <span>{activeUsers} visitante {activeUsers !== 1 ? "s" : ""} mirando ahora </span>
    </aside>
  );
}

export default VisitsCounter;
