import { useCallback, useRef, useState } from "react";
import { apiCallBlob, IS_DEMO_MODE } from "../api/client.js";

async function playOpenAiSpeech(text, context, audioRef, onDone) {
  const blob = await apiCallBlob("/api/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, context }),
  });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audioRef.current = audio;
  audio.onended = () => {
    URL.revokeObjectURL(url);
    onDone();
  };
  audio.onerror = onDone;
  await audio.play();
}

function playBrowserSpeech(text, onDone) {
  if (!("speechSynthesis" in window)) {
    onDone();
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "hi-IN";
  utter.rate = 0.9;
  utter.pitch = 1;
  utter.onend = onDone;
  utter.onerror = onDone;
  window.speechSynthesis.speak(utter);
}

export function useSpeakInstruction({ context = "patient_instruction" } = {}) {
  const [speakingId, setSpeakingId] = useState(null);
  const audioRef = useRef(null);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (text, id = "default") =>
      new Promise((resolve) => {
        if (!text?.trim()) {
          resolve();
          return;
        }

        stop();
        setSpeakingId(id);

        const finish = () => {
          setSpeakingId(null);
          resolve();
        };

        const hasBackend = Boolean(import.meta.env.VITE_API_BASE_URL) && !IS_DEMO_MODE;

        if (hasBackend) {
          playOpenAiSpeech(text, context, audioRef, finish).catch(() => {
            playBrowserSpeech(text, finish);
          });
          return;
        }

        playBrowserSpeech(text, finish);
      }),
    [context, stop]
  );

  const speakAll = useCallback(
    async (medicines) => {
      for (const med of medicines) {
        await speak(med.voiceScript || med.instruction, med.id);
        await new Promise((r) => setTimeout(r, 400));
      }
    },
    [speak]
  );

  return { speak, speakAll, stop, speakingId, isSpeaking: speakingId !== null };
}
