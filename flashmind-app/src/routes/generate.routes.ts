import express from "express";
import { z } from "zod";
import { OpenAI } from "openai";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/dummy", (_req, res) => {
  res.json({
    cards: [
      { front: "What year did WW II start?", back: "1939" },
      { front: "Capital of France?", back: "Paris" },
      { front: "Speed of light?", back: "≈299,792,458 m/s" },
      { front: "Author of '1984'?", back: "George Orwell" },
      { front: "Water's chemical formula?", back: "H₂O" },
    ],
  });
});

router.post("/", async (req, res) => {
  const InputSchema = z.object({
    notes: z.string().min(10, "Lecture notes must be at least 10 characters"),
  });

  const result = InputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors });
  }

  const { notes } = result.data;

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      instructions:
        'You are a flashcard generator. Return ONLY valid JSON exactly in the form {"cards":[{"front":"","back":""}]}. No markdown, no explanations.',
      input: notes,
      max_output_tokens: 600,
      temperature: 0.5,
    });

    const rawContent = response.output_text ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      console.error("JSON.parse failed:", e);
      return res.status(502).json({ error: "OpenAI did not return JSON", raw: rawContent });
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray((parsed as any).cards)
    ) {
      console.error("Unexpected OpenAI response shape:", rawContent);
      return res.status(502).json({ error: "Unexpected OpenAI response", raw: rawContent });
    }

    const cards = (parsed as { cards: { front: string; back: string }[] }).cards;
    res.json({ cards });
  } catch (err) {
    console.error("OpenAI error", err);
    res.status(500).json({ error: "OpenAI error", details: (err as Error).message });
  }
});

export default router;
