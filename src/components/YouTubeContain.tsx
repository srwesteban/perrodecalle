// YouTubeContain.tsx
import React from "react";

type Props = {
  src?: string;        // ID o URL de YouTube/Shorts/Playlist
  title?: string;
  className?: string;
  onReady?: () => void; // se llama cuando el iframe termina de cargar
};

const DEFAULT_ID = "V1SPQGiU9q4";

function parseYouTube(input?: string): { videoId?: string; playlistId?: string } {
  const out: { videoId?: string; playlistId?: string } = {};
  if (!input) return { videoId: DEFAULT_ID };

  // ID directo
  if (/^[\w-]{11}$/.test(input)) return { videoId: input };

  try {
    const u = new URL(input);
    const v = u.searchParams.get("v") || undefined;
    const list = u.searchParams.get("list") || undefined;

    // youtu.be/<id>
    if (u.hostname.includes("youtu.be")) out.videoId = u.pathname.slice(1) || v;

    // /shorts/<id>
    if (u.pathname.startsWith("/shorts/")) out.videoId = u.pathname.split("/")[2];

    // /embed/<id>
    if (u.pathname.startsWith("/embed/")) out.videoId = u.pathname.split("/").pop() || v;

    // watch?v=<id>
    if (!out.videoId && v) out.videoId = v;

    if (list) out.playlistId = list;
  } catch {
    // si no es URL válida, cae al default
  }

  return out.videoId ? out : { videoId: DEFAULT_ID };
}

export default function YouTubeContain({
  src,
  title = "YouTube video",
  className = "",
  onReady,
}: Props) {
  const { videoId, playlistId } = parseYouTube(src);

  // Construye URL de /embed (nunca /watch)
  let embed =
    videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : `https://www.youtube.com/embed/videoseries?list=${playlistId}`;

  const qs = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1" });
  if (videoId && playlistId) qs.set("list", playlistId);
  embed += `?${qs.toString()}`;

  return (
    <div className={`relative ${className}`}>
      <iframe
        key={`${videoId || "pl"}-${playlistId || "none"}`} // fuerza remount al cambiar
        src={embed}
        title={title}
        // Nada de loading="lazy" -> queremos prioridad para el video
        onLoad={onReady}
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}
