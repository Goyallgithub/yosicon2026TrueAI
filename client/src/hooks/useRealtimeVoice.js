import { useState, useRef, useCallback, useEffect } from "react";
import { apiCall, apiCallBlob, apiCallForm } from "../api/client.js";
import { captureFrameFromVideo, requestAvStreams } from "../utils/cameraUtils.js";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

function getUserFriendlyError(err) {
  if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
    return "Camera or microphone permission denied. Please allow access and try again.";
  }
  if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
    return "No camera or microphone found on this device.";
  }
  if (err?.message?.includes("Could not start voice session")) {
    return "Voice service unavailable, please retry.";
  }
  return err?.message || "Voice connection failed. Please retry.";
}

function waitForDataChannel(dc, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    if (dc.readyState === "open") {
      resolve();
      return;
    }
    const timer = setTimeout(() => reject(new Error("Voice channel timed out")), timeoutMs);
    dc.addEventListener(
      "open",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true }
    );
    dc.addEventListener(
      "error",
      () => {
        clearTimeout(timer);
        reject(new Error("Voice channel error"));
      },
      { once: true }
    );
  });
}

function sendEvent(dc, payload) {
  if (dc?.readyState === "open") {
    dc.send(JSON.stringify(payload));
  }
}

export function useRealtimeVoice({
  language = "both",
  onTranscriptUpdate,
  onSessionEnd,
  onMessagesUpdate,
}) {
  const [connectionState, setConnectionState] = useState("idle");
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [error, setError] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [messages, setMessages] = useState([]);
  const [agentPartial, setAgentPartial] = useState("");
  const [videoStream, setVideoStream] = useState(null);

  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const dcRef = useRef(null);
  const audioElRef = useRef(null);
  const transcriptPartsRef = useRef([]);
  const messagesRef = useRef([]);
  const connectionStateRef = useRef("idle");
  const startingRef = useRef(false);
  const agentPartialRef = useRef("");
  const agentSpeakingRef = useRef(false);

  const setMicEnabled = useCallback((enabled) => {
    streamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = enabled;
    });
  }, []);

  const setState = useCallback((state) => {
    connectionStateRef.current = state;
    setConnectionState(state);
  }, []);

  const syncTranscript = useCallback(() => {
    const full = transcriptPartsRef.current.join("\n");
    setLiveTranscript(full);
    onTranscriptUpdate?.(full);
  }, [onTranscriptUpdate]);

  const pushMessage = useCallback(
    (role, text) => {
      if (!text?.trim()) return;
      const entry = { id: `${Date.now()}-${Math.random()}`, role, text: text.trim() };
      messagesRef.current = [...messagesRef.current, entry];
      setMessages(messagesRef.current);
      onMessagesUpdate?.(messagesRef.current);

      const label = role === "user" ? "Patient" : "Rakshak";
      transcriptPartsRef.current.push(`${label}: ${text.trim()}`);
      syncTranscript();
    },
    [onMessagesUpdate, syncTranscript]
  );

  const cleanup = useCallback(() => {
    try {
      dcRef.current?.close();
    } catch {
      /* ignore */
    }
    dcRef.current = null;

    try {
      pcRef.current?.close();
    } catch {
      /* ignore */
    }
    pcRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setVideoStream(null);

    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.srcObject = null;
      if (audioElRef.current.parentNode) {
        audioElRef.current.parentNode.removeChild(audioElRef.current);
      }
      audioElRef.current = null;
    }

    startingRef.current = false;
    agentPartialRef.current = "";
    agentSpeakingRef.current = false;
    setAgentPartial("");
    setActiveSpeaker(null);
  }, []);

  const stop = useCallback(() => {
    const finalTranscript = transcriptPartsRef.current.join("\n").trim();
    const patientSnapshot = captureFrameFromVideo(videoRef.current);
    cleanup();
    setState("idle");
    if (finalTranscript) {
      onSessionEnd?.(finalTranscript, { patientSnapshot });
    }
  }, [cleanup, onSessionEnd, setState]);

  const handleDataChannelMessage = useCallback(
    (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "input_audio_buffer.speech_started") {
          if (agentSpeakingRef.current) return;
          setActiveSpeaker("user");
          if (connectionStateRef.current !== "wrapping-up") {
            setState("user-speaking");
          }
        }

        if (msg.type === "input_audio_buffer.speech_stopped") {
          if (agentSpeakingRef.current) return;
          setActiveSpeaker(null);
        }

        if (msg.type === "response.created") {
          agentSpeakingRef.current = true;
          setMicEnabled(false);
          setActiveSpeaker("agent");
          setState("agent-speaking");
        }

        if (msg.type === "conversation.item.input_audio_transcription.completed") {
          pushMessage("user", msg.transcript);
        }

        if (msg.type === "response.audio_transcript.delta") {
          agentPartialRef.current += msg.delta || "";
          setAgentPartial(agentPartialRef.current);
          setActiveSpeaker("agent");
          setState("agent-speaking");
        }

        if (msg.type === "response.audio_transcript.done") {
          pushMessage("agent", msg.transcript);
          agentPartialRef.current = "";
          setAgentPartial("");
        }

        if (msg.type === "output_audio_buffer.started") {
          agentSpeakingRef.current = true;
          setMicEnabled(false);
          setActiveSpeaker("agent");
          setState("agent-speaking");
        }

        if (msg.type === "output_audio_buffer.stopped") {
          agentSpeakingRef.current = false;
          setMicEnabled(true);
          setActiveSpeaker(null);
          if (connectionStateRef.current !== "wrapping-up") {
            setState("listening");
          }
        }

        if (msg.type === "response.done") {
          agentSpeakingRef.current = false;
          setMicEnabled(true);
          if (connectionStateRef.current !== "wrapping-up") {
            setState("listening");
          }
        }

        if (msg.type === "error") {
          setError(msg.error?.message || "Realtime session error");
          setState("error");
        }
      } catch {
        /* ignore malformed events */
      }
    },
    [pushMessage, setMicEnabled, setState]
  );

  const start = useCallback(async () => {
    const current = connectionStateRef.current;
    if (current !== "idle" && current !== "error") return;
    if (startingRef.current) return;
    startingRef.current = true;

    try {
      setError(null);
      transcriptPartsRef.current = [];
      messagesRef.current = [];
      setMessages([]);
      setLiveTranscript("");
      setAgentPartial("");
      agentPartialRef.current = "";
      setState("requesting-mic");

      const { stream } = await requestAvStreams();
      streamRef.current = stream;
      setVideoStream(stream);

      setState("connecting");

      const session = await apiCall("/api/realtime-session", {
        method: "POST",
        body: JSON.stringify({ language }),
      });

      const ephemeralKey = session.client_secret || session.value;
      if (!ephemeralKey) throw new Error("Could not start voice session");

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioEl.setAttribute("playsinline", "true");
      document.body.appendChild(audioEl);
      audioElRef.current = audioEl;

      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
        audioEl.play().catch(() => {
          /* autoplay blocked — user gesture already happened */
        });
      };

      stream.getAudioTracks().forEach((track) => pc.addTrack(track, stream));

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;
      dc.addEventListener("message", handleDataChannelMessage);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) throw new Error("Could not start voice session");

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      await waitForDataChannel(dc);

      await new Promise((resolve) => setTimeout(resolve, 500));
      sendEvent(dc, { type: "response.create" });

      agentSpeakingRef.current = true;
      setMicEnabled(false);
      startingRef.current = false;
    } catch (err) {
      const message = getUserFriendlyError(err);
      setError(message);
      setState("error");
      cleanup();
    }
  }, [cleanup, handleDataChannelMessage, language, setMicEnabled, setState]);

  const endConversation = useCallback(() => {
    if (connectionStateRef.current === "idle") return;
    setState("wrapping-up");
    stop();
  }, [setState, stop]);

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    connectionState,
    activeSpeaker,
    error,
    liveTranscript,
    messages,
    agentPartial,
    videoStream,
    videoRef,
    start,
    stop: endConversation,
  };
}

export function useFallbackVoice({
  language = "both",
  onTranscriptUpdate,
  onSessionEnd,
  onMessagesUpdate,
}) {
  const [connectionState, setConnectionState] = useState("idle");
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [error, setError] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [messages, setMessages] = useState([]);
  const [videoStream, setVideoStream] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const chunksRef = useRef([]);
  const historyRef = useRef([]);
  const transcriptPartsRef = useRef([]);
  const messagesRef = useRef([]);
  const activeRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const audioRef = useRef(null);
  const startListeningRef = useRef(null);

  const pushMessage = useCallback(
    (role, text) => {
      if (!text?.trim()) return;
      const entry = { id: `${Date.now()}-${Math.random()}`, role, text: text.trim() };
      messagesRef.current = [...messagesRef.current, entry];
      setMessages(messagesRef.current);
      onMessagesUpdate?.(messagesRef.current);
      const label = role === "user" ? "Patient" : "Rakshak";
      transcriptPartsRef.current.push(`${label}: ${text.trim()}`);
      const full = transcriptPartsRef.current.join("\n");
      setLiveTranscript(full);
      onTranscriptUpdate?.(full);
    },
    [onMessagesUpdate, onTranscriptUpdate]
  );

  const cleanup = useCallback(() => {
    activeRef.current = false;
    clearTimeout(silenceTimerRef.current);
    if (mediaRecorderRef.current?.state !== "inactive") {
      try {
        mediaRecorderRef.current?.stop();
      } catch {
        /* ignore */
      }
    }
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setVideoStream(null);
    chunksRef.current = [];
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setActiveSpeaker(null);
  }, []);

  const stop = useCallback(() => {
    const finalTranscript = transcriptPartsRef.current.join("\n").trim();
    const patientSnapshot = captureFrameFromVideo(videoRef.current);
    cleanup();
    setConnectionState("idle");
    if (finalTranscript) onSessionEnd?.(finalTranscript, { patientSnapshot });
  }, [cleanup, onSessionEnd]);

  const playGreeting = useCallback(async () => {
    const greetings = {
      en: "Hi! I'm Rakshak from the eye clinic. Quick 2-minute intake — what eye problem are you having?",
      hi: "Namaste! Main Rakshak, aankh clinic se. 2 minute — aaj aankh mein kya problem hai?",
      ta: "Vanakkam! Naan Rakshak, kann clinic-la. 2 nimidam — kann-la enna problem?",
      both: "Vanakkam / Namaste! Hi, I'm Rakshak from the eye clinic. Enna eye problem / aankh mein kya problem?",
    };
    const text = greetings[language] || greetings.both;
    pushMessage("agent", text);
    setConnectionState("agent-speaking");
    setActiveSpeaker("agent");

    try {
      const audioBlob = await apiCallBlob("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (activeRef.current) {
          setConnectionState("listening");
          setActiveSpeaker(null);
          startListeningRef.current?.();
        }
      };
      await audio.play();
    } catch {
      if (activeRef.current) setConnectionState("listening");
    }
  }, [language, pushMessage]);

  const processRecording = useCallback(async () => {
    if (!activeRef.current) return;

    if (chunksRef.current.length === 0) {
      startListeningRef.current?.();
      return;
    }

    try {
      setConnectionState("connecting");
      setActiveSpeaker(null);
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      chunksRef.current = [];

      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const { transcript } = await apiCallForm("/api/transcribe", formData);
      if (!transcript?.trim()) {
        startListeningRef.current?.();
        return;
      }

      pushMessage("user", transcript);

      const { reply } = await apiCall("/api/fallback-turn", {
        method: "POST",
        body: JSON.stringify({ transcript, history: historyRef.current, language }),
      });

      historyRef.current.push({ role: "user", content: transcript });
      historyRef.current.push({ role: "assistant", content: reply });
      pushMessage("agent", reply);

      setConnectionState("agent-speaking");
      setActiveSpeaker("agent");

      const audioBlob = await apiCallBlob("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reply }),
      });

      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (activeRef.current) {
          setConnectionState("listening");
          setActiveSpeaker(null);
          startListeningRef.current?.();
        }
      };
      await audio.play();
    } catch (err) {
      setError(err.message || "Fallback voice failed");
      setConnectionState("error");
      cleanup();
    }
  }, [cleanup, language, pushMessage]);

  startListeningRef.current = () => {
    if (!streamRef.current || !activeRef.current) return;

    setConnectionState("listening");
    setActiveSpeaker("user");

    const recorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      if (activeRef.current) processRecording();
    };

    recorder.start(250);

    silenceTimerRef.current = setTimeout(() => {
      if (recorder.state === "recording" && activeRef.current) recorder.stop();
    }, 5000);
  };

  const start = useCallback(async () => {
    if (connectionState !== "idle" && connectionState !== "error") return;

    try {
      setError(null);
      transcriptPartsRef.current = [];
      messagesRef.current = [];
      historyRef.current = [];
      setMessages([]);
      setLiveTranscript("");
      setConnectionState("requesting-mic");

      const { stream } = await requestAvStreams();
      streamRef.current = stream;
      setVideoStream(stream);
      activeRef.current = true;

      await playGreeting();
    } catch (err) {
      setError(getUserFriendlyError(err));
      setConnectionState("error");
      cleanup();
    }
  }, [cleanup, connectionState, playGreeting]);

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    connectionState,
    activeSpeaker,
    error,
    liveTranscript,
    messages,
    agentPartial: "",
    videoStream,
    videoRef,
    start,
    stop,
  };
}
