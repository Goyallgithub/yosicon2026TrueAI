import { useRealtimeVoice, useFallbackVoice } from "./useRealtimeVoice.js";

export function useVoice({
  useRealtime,
  language = "both",
  onTranscriptUpdate,
  onSessionEnd,
  onMessagesUpdate,
}) {
  const realtime = useRealtimeVoice({
    language,
    onTranscriptUpdate,
    onSessionEnd,
    onMessagesUpdate,
  });
  const fallback = useFallbackVoice({
    language,
    onTranscriptUpdate,
    onSessionEnd,
    onMessagesUpdate,
  });
  return useRealtime ? realtime : fallback;
}
