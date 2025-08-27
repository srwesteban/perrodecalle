// import { useMemo } from "react";
// import WompiButton from "./WompiButton";

// export default function Wompi() {
//   // fija la referencia una sola vez
//   const reference = useMemo(() => `DON-${Date.now()}`, []);

//   return (
//     <div className="space-y-2">
//       <h3 className="font-semibold">Donar</h3>

//       <WompiButton
//         amountInCents={150000}          // ✅ $1.500 COP
//         currency="COP"                  // ✅ mayúsculas
//         reference={reference}           // ✅ debe coincidir con la firma
//         redirectUrl={`${window.location.origin}/gracias`}
//       />

//       <WompiButton
//         amountInCents={200000}          // ✅ $2.000 COP
//         currency="COP"
//         reference={reference}
//         redirectUrl={`${window.location.origin}/gracias`}
//       />
//     </div>
//   );
// }
