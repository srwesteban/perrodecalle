type Props = { href?: string; label?: string };

export default function DonateWithBold({
  href = "https://checkout.bold.co/payment/LNK_6NV2L6HA8U",
  label = "Donar $1.000",
}: Props) {
  const openPopup = () => {
    const w = window.open(
      href,
      "bold_checkout",
      "width=480,height=720,menubar=no,toolbar=no,location=no,status=no"
    );
    const t = setInterval(() => { if (!w || w.closed) clearInterval(t); }, 800);
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <button onClick={openPopup}
        className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:opacity-90 transition">
        {label}
      </button>
    </div>
  );
}
