import { Router } from "express";
import { getOpenAI } from "../lib/openaiClient.js";
import { visualObservationSchema } from "../schemas/visualObservation.js";

const router = Router();

const ANALYSIS_PROMPT = `You are a clinical image reviewer. Analyze ONLY what is clearly visible in this patient intake webcam photo.

Rules:
- Do NOT guess or infer medical conditions you cannot directly see.
- Do NOT diagnose. List only objective visible observations (e.g. "patient appears flushed", "visible distress", "holding chest area", "bandage on left arm").
- If image is dark, blurry, or face not visible, set insufficient_for_analysis to true and image_quality to poor or unusable.
- visible_observations must be empty array if nothing clinically relevant is clearly visible.
- clinical_notes should be one conservative sentence for a physician in English, or state that no clear visual findings are visible.
- Write visible_observations in English only.`;

router.post("/", async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
      return res.status(400).json({ error: "image must be a data URL (data:image/...)" });
    }

    const client = getOpenAI();

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: ANALYSIS_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this patient intake webcam capture." },
            { type: "image_url", image_url: { url: image, detail: "low" } },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: visualObservationSchema,
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: "Vision model returned empty response" });
    }

    let data;
    try {
      data = JSON.parse(content);
    } catch {
      return res.status(502).json({ error: "Failed to parse vision response" });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
