import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Flashcard from "../components/Flashcard";
import { generateDummy } from "../api/flashcards";
import { getLectures } from "../api/chat";

type FlashcardType = {
  front: string;
  back: string;
  lectureId: string;
  isKnown?: boolean;
  isReview?: boolean;
};

type Props = {
  chatId: string;
  chatName: string;
  lectureId: string;
  lectureName: string;
};

export default function FlashcardPage({ chatId, chatName, lectureId, lectureName }: Props) {
  const [notes, setNotes] = useState("");
  const [cards, setCards] = useState<FlashcardType[]>([]);
  const [knownCards, setKnownCards] = useState<FlashcardType[]>([]);
  const [reviewCards, setReviewCards] = useState<FlashcardType[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const current = cards.length > 0 && index >= 0 && index < cards.length ? cards[index] : null;
  const canPrev = index > 0;
  const canNext = index < cards.length - 1;

  useEffect(() => {
    setIndex((prev) => (cards.length === 0 ? 0 : Math.min(prev, cards.length - 1)));
  }, [cards.length]);

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const lectures = await getLectures(chatId);
        const lecture = lectures.find((l) => l.id === lectureId);
        if (!lecture) throw new Error("Lecture not found");
        setNotes(lecture.notes || "");
        setCards(lecture.flashcards || []);
        setIndex(0);
        setFlipped(false);
        setKnownCards([]);
        setReviewCards([]);
      } catch {
        setError("Failed to load lecture");
      }
    };

    fetchLecture();
  }, [chatId, lectureId]);

  async function handleGenerate() {
    setError("");
    if (!notes.trim()) return;
    setBusy(true);
    try {
      const results = await generateDummy(notes);
      const flashcards: FlashcardType[] = results.map((c) => ({
        ...c,
        lectureId,
        isKnown: false,
        isReview: false,
      }));
      setCards(flashcards);
      setIndex(0);
      setFlipped(false);
      setKnownCards([]);
      setReviewCards([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleDrop(
    e: React.DragEvent,
    setter: React.Dispatch<React.SetStateAction<FlashcardType[]>>
  ) {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;
    const card = JSON.parse(data) as FlashcardType;
    setter((list) => (list.some((c) => c.front === card.front) ? list : [...list, card]));
    setCards((all) => all.filter((c) => c.front !== card.front));
    setFlipped(false);
  }

  function handleReAddCard(
    card: FlashcardType,
    remover: React.Dispatch<React.SetStateAction<FlashcardType[]>>
  ) {
    setCards((prev) => [...prev, card]);
    remover((prev) => prev.filter((c) => c.front !== card.front));
    setIndex(cards.length);
    setFlipped(false);
  }

  return (
    <main className="grid h-screen w-full overflow-hidden grid-rows-2 md:grid-rows-1 md:grid-cols-2 bg-gray-100">
      {/* Notes Section */}
      <section className="flex flex-col gap-6 p-6 md:p-10 overflow-hidden">
        <header>
          <h1 className="text-4xl font-extrabold leading-tight text-gray-800">📖 {lectureName}</h1>
          <p className="mt-2 font-extrabold text-sm text-gray-500">Chat: {chatName}</p>
        </header>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste lecture notes here…"
          rows={20}
          className="resize-none rounded-xl border bg-white p-4 shadow-inner outline-none focus:ring flex-1"
        />

        <button
          onClick={handleGenerate}
          disabled={busy || !notes.trim()}
          className="w-max rounded-full bg-emerald-600 px-8 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? "Generating…" : "Generate"}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </section>

      {/* Flashcards & Drop Zones */}
      <section className="flex flex-col justify-between p-6 md:p-10 overflow-hidden">
        <div className="flex flex-col items-center">
          {cards.length === 0 ? (
            <p className="text-gray-400">Your flashcards will appear here.</p>
          ) : (
            current && (
              <Flashcard
                front={current.front}
                back={current.back}
                flipped={flipped}
                onFlip={() => setFlipped(!flipped)}
              />
            )
          )}

          {cards.length > 0 && (
            <div className="mt-6 flex justify-center gap-6">
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
              <span className="text-sm text-gray-600">{index + 1} / {cards.length}</span>
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
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-6 h-[40%] max-w-full overflow-hidden">
          <section
            className="flex-1 h-full overflow-auto rounded-2xl border border-green-300 bg-green-50 p-4 shadow-sm transition hover:shadow-md"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, setKnownCards)}
          >
            <h2 className="mb-2 text-base font-semibold text-green-800">I know these ✅</h2>
            <div className="grid grid-cols-1 gap-2">
              {knownCards.map((c, i) => (
                <div key={i} onClick={() => handleReAddCard(c, setKnownCards)}>
                  <Flashcard front={c.front} back={c.back} flipped={false} onFlip={() => {}} small />
                </div>
              ))}
            </div>
          </section>

          <section
            className="flex-1 h-full overflow-auto rounded-2xl border border-red-300 bg-red-50 p-4 shadow-sm transition hover:shadow-md"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, setReviewCards)}
          >
            <h2 className="mb-2 text-base font-semibold text-red-800">Review later 🕓</h2>
            <div className="grid grid-cols-1 gap-2">
              {reviewCards.map((c, i) => (
                <div key={i} onClick={() => handleReAddCard(c, setReviewCards)}>
                  <Flashcard front={c.front} back={c.back} flipped={false} onFlip={() => {}} small />
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
