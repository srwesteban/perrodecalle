import FacebookVideos from "./FacebookVideos";

function MediaFeed() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FacebookVideos
        videos={[
          "https://www.facebook.com/watch/?v=1098822748284759",
          "https://www.facebook.com/watch/?v=123456789012345",
        ]}
      />
    </div>
  );
}

export default MediaFeed;
