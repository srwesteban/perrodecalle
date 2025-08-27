type Props = {
  username: string; // usuario de instagram, sin @
};

export default function InstagramButton({ username }: Props) {
  const url = `https://instagram.com/${username}`;

  function openInstagram() {
    window.open(url, "_blank");
  }

  return (
    <button
      onClick={openInstagram}
      className="w-full flex items-center justify-center gap-2 px-4 py-3
                 rounded-lg bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500
                 hover:opacity-90 text-white font-semibold transition opacity-70"
    >
      {/* Icono Instagram en SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        className="w-5 h-5 fill-white"
      >
        <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9
        0 63.6 51.3 114.9 114.9 114.9 63.6 0 114.9-51.3
        114.9-114.9 0-63.6-51.3-114.9-114.9-114.9zm0
        190.7c-41.9 0-75.8-33.9-75.8-75.8s33.9-75.8
        75.8-75.8 75.8 33.9 75.8 75.8-33.9 75.8-75.8
        75.8zm146.4-194.3c0 14.9-12 26.9-26.9
        26.9-14.9 0-26.9-12-26.9-26.9s12-26.9
        26.9-26.9 26.9 12 26.9 26.9zm76.1
        27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.5-93.9-36.2-37-2.1-147.8-2.1-184.8
        0-35.8 1.7-67.7 9.9-93.9 36.2-26.2 26.2-34.5
        58-36.2 93.9-2.1 37-2.1 147.8 0
        184.8 1.7 35.9 9.9 67.7 36.2 93.9 26.2
        26.2 58 34.5 93.9 36.2 37 2.1 147.8
        2.1 184.8 0 35.9-1.7 67.7-9.9
        93.9-36.2 26.2-26.2 34.5-58
        36.2-93.9 2.1-37 2.1-147.7 0-184.7z" />
      </svg>
      Instagram
    </button>
  );
}
