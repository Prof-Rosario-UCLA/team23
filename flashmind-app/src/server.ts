import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { OpenAI } from "openai";
// for security
import helmet from "helmet";
import { z } from "zod";

const app = express();
const PORT = process.env.PORT || 3001;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ── middleware ─────────────────────────────── */
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(helmet());
app.use(express.json());

app.post("/api/generate/dummy", (_req: Request, res: Response) => {
  res.json({
    cards: [
      { front: "What year did WW II start?", back: "1939" },
      { front: "Capital of France?", back: "Paris" },
      { front: "Speed of light (m/s)?", back: "≈299 792 458" },
    ],
  });
});

/* ── generate flashcards (no auth) ──────────── */
app.post("/api/generate", async (req, res) => {
  const InputSchema = z.object({
    notes: z.string().min(10, "Lecture notes must be at least 10 characters"),
  });

  const result = InputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors });
  }

  const { notes } = result.data;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            'You are a flashcard generator. Return ONLY valid JSON exactly in the form {"cards":[{"front":"","back":""}]}. No markdown, no explanations.',
        },
        {
          role: "user",
          content: `Create concise Q-A flashcards from these lecture notes:\n\n${notes}`,
        },
      ],
      max_completion_tokens: 600,
      temperature: 0.5,
    });

    const rawContent = completion.choices[0].message.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      console.error("JSON.parse failed:", e);
      return res
        .status(502)
        .json({ error: "OpenAI did not return JSON", raw: rawContent });
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray((parsed as any).cards)
    ) {
      console.error("Unexpected OpenAI response shape:", rawContent);
      return res
        .status(502)
        .json({ error: "unexpected OpenAI response", raw: rawContent });
    }

    const cards = (parsed as { cards: { front: string; back: string }[] })
      .cards;
    res.json({ cards });
  } catch (err) {
    console.error("OpenAI error", err);
    res
      .status(500)
      .json({ error: "OpenAI error", details: (err as Error).message });
  }
});

/* ── start ────────────────────────────────────── */
app.listen(PORT, () =>
  console.log(`API listening on http://localhost:${PORT}`)
);
