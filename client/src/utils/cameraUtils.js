export function captureFrameFromVideo(videoEl) {
  if (!videoEl || !videoEl.videoWidth || !videoEl.videoHeight) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export async function requestAvStreams() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: {
      facingMode: "user",
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
  });

  return {
    stream,
    audioTracks: stream.getAudioTracks(),
    videoTracks: stream.getVideoTracks(),
  };
}

export function stopStream(stream) {
  stream?.getTracks().forEach((t) => t.stop());
}
