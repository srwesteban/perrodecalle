type Props = {
  phone: string; // número sin signos, solo indicativo + número
  text?: string; // mensaje opcional
};

export default function WhatsAppButton({ phone, text }: Props) {
  const baseUrl = "https://wa.me/";
  const url = text
    ? `${baseUrl}${phone}?text=${encodeURIComponent(text)}`
    : `${baseUrl}${phone}`;

  function openWhatsApp() {
    window.open(url, "_blank");
  }

  return (
    <button
      onClick={openWhatsApp}
      className="w-full flex items-center justify-center gap-2 px-4 py-3
                 rounded-lg bg-green-600 hover:bg-green-500
                 text-white font-semibold transition"
    >
      {/* Icono WhatsApp en SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        className="w-5 h-5 fill-white"
      >
        <path d="M380.9 97.1C339-1.3 243.2-32 144.9 9.9 61.2
                 44.3 17.7 125.2 17.7 202.9c0 41.3 13.6
                 81.2 39.1 114.2L0 480l166-54.4c31.9
                 17.5 68.1 26.8 104.9 26.8 77.7 0 158.6-43.6
                 193-127.2 41.9-98.3 10.2-194.1-83-228.1zM224
                 413.5c-30.4 0-60.2-8.4-86.1-24.3l-6.2-3.7-98.4
                 32.2 32.8-95.7-3.9-6.3c-23.3-30-35.6-65.8-35.6-103.1
                 0-94.5 76.9-171.4 171.4-171.4 45.8 0 88.9 17.8
                 121.2 50.1s50.1 75.4 50.1 121.2c0 94.5-76.9
                 171.4-171.3 171.4zm97.5-130.6c-5.3-2.6-31.3-15.4-36.2-17.1s-8.4-2.6-12
                 2.6-13.7 17.1-16.8 20.6-6.2 3.9-11.5 1.3c-5.3-2.6-22.4-8.3-42.6-26.4-15.8-14.1-26.4-31.5-29-36.8s-.3-8.1
                 2.3-10.7c2.3-2.3 5.3-6.2 7.9-9.3 2.6-3.1 3.9-5.2 5.9-7.8
                 2-2.6 1-4.9-.3-7.5s-12-29.1-16.5-39.8c-4.3-10.4-8.7-8.9-12-9.1-3.1-.2-6.7-.2-10.2-.2s-9.3 1.3-14.2
                 6.6c-4.9 5.2-18.7 18.3-18.7 44.6s19.2 51.7 21.8
                 55.3c2.6 3.5 38.1 58.2 92.4 81.6 12.9 5.6 23
                 8.9 31 11.4 13 2.9 24.8 2.5 34.1 1.5 10.4-1
                 31.3-12.8 35.7-25.1 4.4-12.3 4.4-22.8 3.1-25.1-1.3-2.3-4.8-3.9-10.1-6.6z" />
      </svg>
      WhatsApp
    </button>
  );
}
