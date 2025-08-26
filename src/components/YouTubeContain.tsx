type Props = {
  src?: string;
  title?: string;
  className?: string;
};

const DEFAULT_ID = "V1SPQGiU9q4"; // RenéZZ

function getYouTubeId(input?: string): string {
  if (!input) return DEFAULT_ID;
  try {
    if (/^[\w-]{11}$/.test(input)) return input;
    const u = new URL(input);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.pathname.startsWith("/embed/")) return u.pathname.split("/").pop() || DEFAULT_ID;
    return u.searchParams.get("v") || DEFAULT_ID;
  } catch {
    return DEFAULT_ID;
  }
}

export default function YouTubeContain({
  src,
  title = "YouTube video",
  className = "",
}: Props) {
  const id = getYouTubeId(src);
  const embed = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;

  return (
    <div
      className={`relative w-full aspect-video ${className}`}
    >
      <iframe
        src={embed}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 w-full h-full rounded-lg border-0"
      />
    </div>
  );
}
