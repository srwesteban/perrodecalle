function Historial() {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">📜 Historial de Donaciones</p>
      <ul className="space-y-1 text-sm text-gray-300">
        <li>Juan donó $10.000</li>
        <li>Ana donó $5.000</li>
        <li>Carlos donó $20.000</li>
      </ul>
    </div>
  );
}

export default Historial;
