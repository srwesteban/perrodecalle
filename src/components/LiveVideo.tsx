import YouTubeContain from "./YouTubeContain";

function LiveVideo() {
  return (
    <div className="w-full h-full bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
      {/* Video responsivo con aspect-ratio 16:9 */}
      <YouTubeContain />
    </div>
  );
}

export default LiveVideo;
