import WompiButton from "./Wompibutton";

export default function Wompi() {
  const ref = `DON-${Date.now()}`; // genera referencias únicas

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Donar</h3>
      <WompiButton
        amountInCents={100000}        // $5.000 COP
        reference={ref}
        redirectUrl={window.location.origin + "/gracias"}
      />
    </div>
  );
}
