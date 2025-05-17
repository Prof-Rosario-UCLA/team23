// src/features/FlashcardPage/FlashcardPage.tsx
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { generateDummy } from "../../api/flashcards";
import Flashcard from "../../components/Flashcard/Flashcard";

export default function FlashcardPage() {
  const [notes, setNotes] = useState("");
  const [cards, setCards] = useState<{ front: string; back: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const current = cards[index];
  const canPrev = index > 0;
  const canNext = index < cards.length - 1;

  async function handleGenerate() {
    setError("");
    if (!notes.trim()) return;
    setBusy(true);
    try {
      const results = await generateDummy(notes);
      setCards(results);
      setIndex(0);
      setFlipped(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen w-screen grid-cols-2 bg-gray-100">
      <div className="flex flex-col gap-6 p-10">
        <header>
          <h1 className="text-4xl font-extrabold leading-tight text-gray-800">
            Flashcard <br /> Generator
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Paste your lecture notes and click <strong>Generate</strong>.
          </p>
        </header>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste lecture notes here…"
          className="flex-1 resize-none rounded-xl border bg-white p-4 shadow-inner outline-none focus:ring"
        />

        <button
          onClick={handleGenerate}
          disabled={busy}
          className="w-max rounded-full bg-emerald-600 px-8 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? "Generating…" : "Generate"}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      <div className="flex flex-col items-center justify-center p-10">
        {cards.length === 0 ? (
          <p className="text-gray-400">Your flashcards will appear here.</p>
        ) : (
          <>
            <Flashcard
              front={current.front}
              back={current.back}
              flipped={flipped}
              onFlip={() => setFlipped(!flipped)}
            />

            <div className="mt-8 flex items-center gap-6">
              <button
                onClick={() => {
                  if (canPrev) setIndex(index - 1);
                  setFlipped(false);
                }}
                disabled={!canPrev}
                className="rounded-full bg-gray-200 p-3 text-gray-600 hover:bg-gray-300 disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600">
                {index + 1} / {cards.length}
              </span>
              <button
                onClick={() => {
                  if (canNext) setIndex(index + 1);
                  setFlipped(false);
                }}
                disabled={!canNext}
                className="rounded-full bg-gray-900 p-3 text-white hover:bg-gray-800 disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
