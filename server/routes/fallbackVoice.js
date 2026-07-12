import { Router } from "express";
import multer from "multer";
import { toFile } from "openai";
import { getOpenAI } from "../lib/openaiClient.js";
import { createNaturalSpeech } from "../lib/tts.js";
import { USE_REALTIME } from "../config.js";
import { VOICE_AGENT_PROMPT, buildVoiceAgentPrompt, VALID_LANGUAGES } from "../prompts/voiceAgent.js";
import { EXTRACTION_PROMPT } from "../prompts/extraction.js";
import { clinicalBriefSchema } from "../schemas/clinicalBrief.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.get("/voice-mode", (_req, res) => {
  res.json({ useRealtime: USE_REALTIME });
});

router.post("/transcribe", upload.single("audio"), async (req, res, next) => {
  try {
    const client = getOpenAI();
    if (!req.file) {
      return res.status(400).json({ error: "audio file is required" });
    }

    const file = await toFile(req.file.buffer, req.file.originalname || "audio.webm", {
      type: req.file.mimetype || "audio/webm",
    });

    const transcription = await client.audio.transcriptions.create({
      model: "whisper-1",
      file,
    });

    res.json({ transcript: transcription.text });
  } catch (err) {
    next(err);
  }
});

router.post("/speak", async (req, res, next) => {
  try {
    const client = getOpenAI();
    const { text, context = "default" } = req.body;
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "text is required and must be a non-empty string" });
    }

    const allowed = ["default", "patient_instruction", "emr_assist", "rakshak"];
    const speechContext = allowed.includes(context) ? context : "default";

    const speech = await createNaturalSpeech(client, {
      text,
      context: speechContext,
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

router.post("/fallback-turn", async (req, res, next) => {
  try {
    const client = getOpenAI();
    const { transcript, history = [], language = "both" } = req.body;

    if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
      return res.status(400).json({ error: "transcript is required and must be a non-empty string" });
    }

    const langPrompt = buildVoiceAgentPrompt(
      VALID_LANGUAGES.has(language) ? language : "both"
    );

    const messages = [
      { role: "system", content: langPrompt },
      ...history,
      { role: "user", content: transcript.trim() },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({ error: "Model returned empty response" });
    }

    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

router.post("/fallback-extract", async (req, res, next) => {
  try {
    const client = getOpenAI();
    const { transcript } = req.body;
    if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
      return res.status(400).json({ error: "transcript is required and must be a non-empty string" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        { role: "user", content: transcript.trim() },
      ],
      response_format: {
        type: "json_schema",
        json_schema: clinicalBriefSchema,
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: "Model returned empty response" });
    }

    let data;
    try {
      data = JSON.parse(content);
    } catch {
      return res.status(502).json({ error: "Failed to parse structured response from model" });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
