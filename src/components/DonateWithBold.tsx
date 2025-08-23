type Props = {
  href?: string; // por si luego cambias el link desde .env
  label?: string;
};

export default function DonateWithBold({
  href = "https://checkout.bold.co/payment/LNK_FKIMP8KWED",
  label = "Donar con Bold",
}: Props) {
  const openPopup = () => {
    const w = window.open(
      href,
      "bold_checkout",
      "width=480,height=720,menubar=no,toolbar=no,location=no,status=no"
    );

    // Opcional: detectar cuando el popup se cierra para refrescar donaciones
    const timer = setInterval(() => {
      if (!w || w.closed) {
        clearInterval(timer);
        // aquí podrías disparar un refetch() de tus donaciones
        console.log("Popup cerrado, refrescar donaciones");
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={openPopup}
        className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:opacity-90 transition"
      >
        {label}
      </button>
    </div>
  );
}
