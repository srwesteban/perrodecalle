import WebcamPreview from "./WebcamPreview";

function LiveVideo() {
  return (
    <div className="w-full aspect-video bg-gray-700 rounded-xl flex items-center justify-center">
            <WebcamPreview />
    </div>
  );
}

export default LiveVideo;
