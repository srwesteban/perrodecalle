import React from "react";
import YouTubeContain from "./YouTubeContain";

export default function LiveVideo() {
  return (
    <div className="w-full h-full bg-gray-700 rounded-xl overflow-hidden">
      {/* Mobile: ratio por ancho (siempre visible) */}
      <div className="block md:hidden w-full aspect-video">
        <YouTubeContain className="w-full h-full" />
      </div>

      {/* Desktop: se ajusta a la altura del slot del grid */}
      <div className="hidden md:flex items-center justify-center h-full">
        <div className="h-full aspect-video">
          <YouTubeContain className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
