import YouTubeContain from "./YouTubeContain";

function LiveVideo() {
  return (
    <div className="w-full bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
      {/* El video ya maneja su alto con aspect-ratio */}
      <YouTubeContain className="max-h-[300px] sm:max-h-[660px]"/>
    </div>
  );
}

export default LiveVideo;
