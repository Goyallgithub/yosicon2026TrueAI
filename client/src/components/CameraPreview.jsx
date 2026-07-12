import { useEffect } from "react";
import { Camera } from "lucide-react";

export default function CameraPreview({ stream, videoRef, active, className = "" }) {
  useEffect(() => {
    const video = videoRef?.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    video.play().catch(() => {
      /* autoplay blocked — user already clicked Start Call */
    });

    return () => {
      video.srcObject = null;
    };
  }, [stream, videoRef]);

  if (!stream) {
    return (
      <div
        className={`relative flex h-28 w-28 items-center justify-center border-4 border-foreground bg-muted ${className}`}
      >
        <Camera className="h-8 w-8 text-foreground/40" strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className={`relative mx-auto h-28 w-28 overflow-hidden border-4 border-foreground shadow-bauhaus ${className}`}>
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="h-full w-full scale-x-[-1] object-cover"
      />
      {active && (
        <div className="absolute left-1.5 top-1.5 flex items-center gap-1 bg-bauhaus-red px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Live
        </div>
      )}
    </div>
  );
}
