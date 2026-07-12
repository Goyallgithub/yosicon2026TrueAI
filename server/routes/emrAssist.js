import { Router } from "express";
import { getOpenAI } from "../lib/openaiClient.js";

const router = Router();

const SYSTEM_PROMPT = `You are an ophthalmology EMR clinical assistant. You help physicians quickly understand patient records and prepare for consultations.

Rules:
- Use medical terminology only (CC, HPI, POH, DDx, VA, IOP, etc.)
- Be concise — physicians are busy
- Highlight critical findings and action items
- Never diagnose definitively — suggest differentials and workup
- If asked about a patient, use ONLY the provided patient data
- Respond in English`;

router.post("/", async (req, res, next) => {
  try {
    const { message, patientContext } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "message is required" });
    }
    if (!patientContext) {
      return res.status(400).json({ error: "patientContext is required" });
    }

    const client = getOpenAI();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Patient EMR Record:\n${JSON.stringify(patientContext, null, 2)}\n\nPhysician query: ${message.trim()}`,
        },
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({ error: "Empty AI response" });
    }

    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

export default router;
