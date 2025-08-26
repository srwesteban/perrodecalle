type Props = {
  videos: string[];
};

export default function FacebookVideos({ videos }: Props) {
  function openFacebook(url: string) {
    window.open(url, "_blank", "width=500,height=700");
  }

  return (
    <div className="flex flex-col gap-3">
      {videos.map((url, i) => (
        <button
          key={i}
          onClick={() => openFacebook(url)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3
                     rounded-lg bg-blue-600 hover:bg-blue-500
                     text-white font-semibold transition"
        >
          {/* Icono Facebook en SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
            className="w-4 h-4 fill-white"
          >
            <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35
              12.42-50.06 52.24-50.06h40.42V6.26S293.3
              0 268.1 0c-73.14 0-121.3 44.38-121.3
              124.72v70.62H86.41V288h60.39v224h92.66V288z" />
          </svg>
          Ver video de Facebook
        </button>
      ))}
    </div>
  );
}
