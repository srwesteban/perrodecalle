import WebcamPreview from "./WebcamPreview";

function LiveVideo() {
  return (
    <div className="w-full h-full bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
      <WebcamPreview />
    </div>
  );
}
export default LiveVideo;
