import WompiPayButton from "../components/WompiPayButton";
import DonationsTable from "../components/DonationsTable";

export default function PayTest() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold">Prueba Wompi (Sandbox)</h1>

      <div className="flex flex-wrap gap-3">
        <WompiPayButton amountCOP={5000}  referenceBase="don" redirectUrl="/wompi/result" />
        <WompiPayButton amountCOP={10000} referenceBase="don" redirectUrl="/wompi/result" />
        <WompiPayButton amountCOP={20000} referenceBase="don" redirectUrl="/wompi/result" />
      </div>

      <h2 className="text-xl font-semibold">Últimos movimientos</h2>
      <DonationsTable />
    </div>
  );
}
