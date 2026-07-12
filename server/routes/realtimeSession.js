import { Router } from "express";
import { getOpenAI } from "../lib/openaiClient.js";
import { buildVoiceAgentPrompt, VALID_LANGUAGES } from "../prompts/voiceAgent.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const client = getOpenAI();
    const language = VALID_LANGUAGES.has(req.body?.language) ? req.body.language : "both";
    const instructions =
      typeof req.body?.instructions === "string" && req.body.instructions.trim()
        ? req.body.instructions.trim()
        : buildVoiceAgentPrompt(language);

    const transcriptionConfig = { model: "whisper-1" };
    if (language === "hi") transcriptionConfig.language = "hi";
    if (language === "en") transcriptionConfig.language = "en";
    if (language === "ta") transcriptionConfig.language = "ta";

    const session = await client.realtime.clientSecrets.create({
      session: {
        type: "realtime",
        model: "gpt-realtime-2.1",
        instructions,
        output_modalities: ["audio"],
        audio: {
          input: {
            transcription: transcriptionConfig,
            noise_reduction: { type: "near_field" },
            turn_detection: {
              type: "server_vad",
              threshold: 0.65,
              prefix_padding_ms: 400,
              silence_duration_ms: 900,
              create_response: true,
              interrupt_response: false,
            },
          },
          output: {
            voice: "cedar",
          },
        },
      },
    });

    res.json({
      client_secret: session.value,
      value: session.value,
      expires_at: session.expires_at,
      language,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
