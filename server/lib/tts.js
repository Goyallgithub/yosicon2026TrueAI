const TTS_CONTEXTS = {
  default: {
    instructions:
      "Speak in a warm, natural, conversational tone. Sound human and friendly — never robotic or monotone.",
  },
  patient_instruction: {
    instructions: `You are a caring Indian eye clinic health educator explaining medicine to a patient.
Speak in natural Hinglish (Hindi-English mix) with a warm, gentle, human voice — like a real nurse at the pharmacy counter.
Pronounce Hindi words naturally. Use a calm, reassuring pace with slight pauses between sentences.
Never sound like a GPS or robot. Be clear about drop timings and eye instructions.`,
  },
  emr_assist: {
    instructions:
      "Speak as a calm, professional physician assistant. Use clear natural medical English at a moderate pace.",
  },
  rakshak: {
    instructions:
      "You are Rakshak, a friendly bilingual eye clinic intake coordinator. Warm, brief, natural Hinglish — human and caring.",
  },
};

export async function createNaturalSpeech(client, { text, context = "default" }) {
  const trimmed = text.trim();
  const style = TTS_CONTEXTS[context] || TTS_CONTEXTS.default;

  // Prefer gpt-4o-mini-tts with style instructions (most natural)
  try {
    return await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "cedar",
      input: trimmed,
      instructions: style.instructions,
    });
  } catch {
    /* fall through to HD TTS */
  }

  return client.audio.speech.create({
    model: "tts-1-hd",
    voice: "cedar",
    input: trimmed,
    speed: 0.96,
  });
}
