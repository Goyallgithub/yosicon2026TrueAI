import { Router } from "express";
import { getOpenAI } from "../lib/openaiClient.js";
import { EXTRACTION_PROMPT } from "../prompts/extraction.js";
import { clinicalBriefSchema } from "../schemas/clinicalBrief.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const client = getOpenAI();
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
      return res.status(400).json({ error: "transcript is required and must be a non-empty string" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
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
