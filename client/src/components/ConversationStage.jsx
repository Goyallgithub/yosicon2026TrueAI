import { useEffect, useRef } from "react";
import VoiceWaveBars, { SpeakingRings, TypingDots } from "./VoiceWaveBars.jsx";
import CameraPreview from "./CameraPreview.jsx";

const STATE_LABELS = {
  idle: "Ready to start your call",
  "requesting-mic": "Connecting camera & microphone…",
  connecting: "Calling Rakshak…",
  listening: "Your turn — speak naturally",
  "user-speaking": "You're speaking",
  "agent-speaking": "Rakshak is talking",
  "wrapping-up": "Saving your report…",
  error: "Connection error",
};

function ChatBubble({ msg, index }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex animate-slide-up ${isUser ? "justify-end" : "justify-start"}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={`max-w-[88%] border-2 border-foreground px-4 py-3 shadow-bauhaus transition-transform duration-200 ${
          isUser ? "bg-bauhaus-yellow text-foreground" : "bg-bauhaus-blue text-white"
        }`}
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="bauhaus-label opacity-70">{isUser ? "You" : "Rakshak"}</span>
          {!isUser && (
            <span className="h-2 w-2 rounded-full bg-bauhaus-yellow animate-pulse" />
          )}
        </div>
        <p className="font-medium leading-relaxed">{msg.text}</p>
      </div>
    </div>
  );
}

export default function ConversationStage({
  connectionState,
  activeSpeaker,
  messages,
  agentPartial,
  error,
  videoStream,
  videoRef,
}) {
  const scrollRef = useRef(null);
  const isLive = !["idle", "error"].includes(connectionState);
  const mayaActive = activeSpeaker === "agent" || connectionState === "agent-speaking";
  const userActive = activeSpeaker === "user" || connectionState === "user-speaking";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, agentPartial]);

  return (
    <div className="flex flex-col gap-5">
      {/* Call header */}
      <div className="flex items-center justify-between border-2 border-foreground bg-foreground px-4 py-2 text-white lg:border-4">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${isLive ? "animate-pulse bg-green-400" : "bg-gray-500"}`} />
          <span className="bauhaus-label text-bauhaus-yellow">
            {isLive ? "Live Call" : "Voice Intake"}
          </span>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-white/60">
          TrueComplaint AI
        </span>
      </div>

      {/* Split stage — phone call layout */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Rakshak panel */}
        <div
          className={`relative overflow-hidden border-2 border-foreground p-5 transition-all duration-300 lg:border-4 ${
            mayaActive ? "bg-bauhaus-blue text-white shadow-bauhaus-lg scale-[1.02]" : "bg-white shadow-bauhaus"
          }`}
        >
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
            <SpeakingRings active={mayaActive} color="border-bauhaus-yellow" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-foreground bg-bauhaus-red">
              <span className="text-2xl font-black text-white">R</span>
            </div>
          </div>
          <p className="mt-3 text-center font-black uppercase tracking-tight">Rakshak</p>
          <p className="text-center text-xs font-medium opacity-70">AI Intake Coordinator</p>
          <div className="mt-4">
            <VoiceWaveBars active={mayaActive} color={mayaActive ? "bg-bauhaus-yellow" : "bg-muted"} />
          </div>
        </div>

        {/* You panel — live camera */}
        <div
          className={`relative overflow-hidden border-2 border-foreground p-5 transition-all duration-300 lg:border-4 ${
            userActive ? "bg-bauhaus-red text-white shadow-bauhaus-lg scale-[1.02]" : "bg-white shadow-bauhaus"
          }`}
        >
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
            <SpeakingRings active={userActive} color="border-bauhaus-red" />
            <CameraPreview
              stream={videoStream}
              videoRef={videoRef}
              active={userActive}
              className={userActive ? "border-white" : ""}
            />
          </div>
          <p className="mt-3 text-center font-black uppercase tracking-tight">You</p>
          <p className="text-center text-xs font-medium opacity-70">
            {videoStream ? "Camera live · audio only to Rakshak" : "Patient"}
          </p>
          <div className="mt-4">
            <VoiceWaveBars active={userActive} color={userActive ? "bg-white" : "bg-muted"} />
          </div>
        </div>
      </div>

      {/* Status */}
      <div
        className={`border-2 border-foreground px-4 py-3 text-center font-bold uppercase tracking-wider shadow-bauhaus-sm lg:border-4 ${
          mayaActive
            ? "bg-bauhaus-blue text-white"
            : userActive
              ? "bg-bauhaus-red text-white"
              : connectionState === "listening"
                ? "bg-bauhaus-yellow"
                : "bg-white"
        }`}
      >
        {STATE_LABELS[connectionState] || connectionState}
      </div>

      {/* Animated chat thread */}
      <div
        ref={scrollRef}
        className="min-h-[200px] max-h-80 space-y-3 overflow-y-auto border-2 border-foreground bg-[#fafafa] p-4 shadow-bauhaus lg:border-4"
      >
        {messages.length === 0 && !agentPartial && isLive && (
          <div className="flex justify-center py-8">
            <div className="text-center">
              <TypingDots />
              <p className="mt-3 text-sm font-medium text-foreground/50">Rakshak is starting the call…</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatBubble key={msg.id} msg={msg} index={i} />
        ))}

        {agentPartial && (
          <div className="flex animate-slide-up justify-start">
            <div className="max-w-[88%] border-2 border-foreground bg-bauhaus-blue px-4 py-3 text-white shadow-bauhaus">
              <p className="bauhaus-label mb-1 opacity-70">Rakshak · speaking</p>
              <p className="font-medium leading-relaxed">
                {agentPartial}
                <TypingDots />
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="border-2 border-foreground bg-bauhaus-red px-4 py-2 text-center text-sm font-medium text-white">
          {error}
        </p>
      )}
    </div>
  );
}
