export function parseTranscriptLines(transcript = "") {
  if (!transcript.trim()) return [];

  return transcript
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const patientMatch = line.match(/^Patient:\s*(.+)/i);
      const agentMatch = line.match(/^(?:Rakshak|Maya):\s*(.+)/i);

      if (patientMatch) {
        return { id: `t-${i}`, role: "user", text: patientMatch[1].trim() };
      }
      if (agentMatch) {
        return { id: `t-${i}`, role: "agent", text: agentMatch[1].trim() };
      }
      return { id: `t-${i}`, role: "system", text: line };
    });
}

export function formatTranscriptPreview(transcript = "", maxLines = 4) {
  const lines = parseTranscriptLines(transcript);
  return lines.slice(-maxLines);
}
