import { useEffect, useRef, useState } from "react";

type Props = { deviceId?: string };

export default function WebcamPreview({ deviceId }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;

    (async () => {
      try {
        setError("");
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: deviceId
            ? { deviceId: { exact: deviceId } }
            : { facingMode: "user" },
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (e: any) {
        setError(
          e?.name === "NotAllowedError"
            ? "Permiso de cámara denegado."
            : e?.message || "No se pudo iniciar la cámara."
        );
      }
    })();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [deviceId]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-black/60 text-white text-sm p-4">
          {error}
        </div>
      )}
    </div>
  );
}
