import WebcamPreview from "./WebcamPreview";
import YouTubeContain from "./YouTubeContain";

function LiveVideo() {
  return (
    <div className="w-full h-full bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
      <YouTubeContain />
    </div>
  );
}
export default LiveVideo;
