import FacebookVideos from "./FacebookVideos";
import WhatsAppButton from "./WhatsAppButton";
import InstagramButton from './InstagramButton';

function MediaFeed() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <FacebookVideos
          videos={[
            "https://www.facebook.com/watch/?v=1098822748284759",
            "https://www.facebook.com/watch/?v=123456789012345",
          ]}
        />
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-1 gap-4">
        <WhatsAppButton phone="573215098953" text="Hola, tengo una duda" />
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-1 gap-4">
        <InstagramButton username="veloelmono"/>
      </div>
    </>
  );
}

export default MediaFeed;
