import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Flashcard from "../components/Flashcard";
import { generateDummy, saveFlashcards, updateFlashcard, getFlashcards } from "../api/flashcards";
import { getLectures, updateLectureNotes } from "../api/chat";

type FlashcardType = {
  id: string;
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

export default function LecturePage({ chatId, chatName, lectureId, lectureName }: Props) {
  const [notes, setNotes] = useState("");
  const [cards, setCards] = useState<FlashcardType[]>([]);
  const [knownCards, setKnownCards] = useState<FlashcardType[]>([]);
  const [reviewCards, setReviewCards] = useState<FlashcardType[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const flashcardSectionRef = useRef<HTMLDivElement>(null);

  const current = cards.length > 0 && index >= 0 && index < cards.length ? cards[index] : null;
  const canPrev = index > 0;
  const canNext = index < cards.length - 1;

  useEffect(() => {
    setIndex((prev) => (cards.length === 0 ? 0 : Math.min(prev, cards.length - 1)));
  }, [cards.length]);

  async function fetchLectureAndCards() {
    try {
      const lectures = await getLectures(chatId);
      const lecture = lectures.find((l) => l.id === lectureId);
      if (!lecture) throw new Error("Lecture not found");

      setNotes(lecture.notes || "");

      const allCards = await getFlashcards(chatId, lectureId);

      const known = allCards.filter((c) => c.isKnown && !c.isReview);
      const review = allCards.filter((c) => c.isReview && !c.isKnown);
      const regular = allCards.filter((c) => !c.isKnown && !c.isReview);

      setKnownCards(known);
      setReviewCards(review);
      setCards(regular);
      setIndex(0);
      setFlipped(false);

      setTimeout(() => {
        flashcardSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);

    } catch {
      setError("Failed to load lecture");
    }
  }

  useEffect(() => {
    fetchLectureAndCards();
  }, [chatId, lectureId]);

  async function handleGenerate() {
    setError("");
    if (!notes.trim()) return;
    setBusy(true);
    try {
      await updateLectureNotes(chatId, lectureId, notes);

      const results: { front: string; back: string }[] = await generateDummy(notes);
      const flashcards = results.map((c) => ({
        front: c.front,
        back: c.back,
      }));

      await saveFlashcards(chatId, lectureId, flashcards);
      await fetchLectureAndCards();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleDrop(
    e: React.DragEvent,
    setter: React.Dispatch<React.SetStateAction<FlashcardType[]>>,
    box: "known" | "review"
  ) {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;

    const card = JSON.parse(data) as FlashcardType;
    const isKnown = box === "known";
    const isReview = box === "review";

    updateFlashcard(chatId, lectureId, card.id, {
      isKnown,
      isReview,
    }).then(() => {
      setter((list) => (list.some((c) => c.id === card.id) ? list : [...list, card]));
      setCards((all) => all.filter((c) => c.id !== card.id));
      setFlipped(false);
    }).catch((err) => {
      console.error("Failed to update flashcard", err);
    });
  }

  function handleReAddCard(
    card: FlashcardType,
    remover: React.Dispatch<React.SetStateAction<FlashcardType[]>>
  ) {
    updateFlashcard(chatId, lectureId, card.id, {
      isKnown: false,
      isReview: false,
    }).then(() => {
      setCards((prev) => [...prev, { ...card, isKnown: false, isReview: false }]);
      remover((prev) => prev.filter((c) => c.id !== card.id));
      setIndex(cards.length);
      setFlipped(false);
    }).catch((err) => {
      console.error("Failed to reset flashcard", err);
    });
  }

  return (
    <main className="grid h-screen w-full overflow-hidden grid-rows-2 md:grid-rows-1 md:grid-cols-2 bg-gray-100">
      {/* Notes Section */}
      <section
        className="flex flex-col gap-6 p-6 md:p-10 overflow-hidden min-h-0"
        aria-label="Lecture Notes"
        role="region"
      >
        <header>
          <h1 className="text-4xl font-extrabold leading-tight text-gray-800">📖 {lectureName}</h1>
          <p className="mt-2 font-extrabold text-sm text-gray-500">Chat: {chatName}</p>
        </header>

        <label htmlFor="notes" className="sr-only">
          Lecture notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste lecture notes here…"
          className="rounded-xl border bg-white p-4 shadow-inner outline-none focus:ring w-full h-[calc(100vh-260px)] md:h-[calc(100vh-280px)] resize-none"
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

      {/* Flashcards Section */}
      <section
        className="flex flex-col justify-between p-6 md:p-10 overflow-hidden min-h-0"
        aria-label="Flashcards Review"
        role="region"
      >
        <div ref={flashcardSectionRef} className="flex flex-col items-center">
          {cards.length === 0 ? (
            <p className="text-gray-400">Your flashcards will appear here.</p>
          ) : (
            current && (
              <Flashcard
                id={current.id}
                front={current.front}
                back={current.back}
                flipped={flipped}
                onFlip={() => setFlipped(!flipped)}
              />
            )
          )}

          {cards.length > 0 && (
            <nav
              className="mt-6 flex justify-center gap-6"
              aria-label="Flashcard navigation"
            >
              <button
                onClick={() => {
                  if (canPrev) setIndex(index - 1);
                  setFlipped(false);
                }}
                disabled={!canPrev}
                className="rounded-full bg-gray-200 p-3 text-gray-600 hover:bg-gray-300 disabled:opacity-40"
                aria-label="Previous flashcard"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <span className="text-sm text-gray-600" aria-live="polite">
                {index + 1} / {cards.length}
              </span>

              <button
                onClick={() => {
                  if (canNext) setIndex(index + 1);
                  setFlipped(false);
                }}
                disabled={!canNext}
                className="rounded-full bg-gray-900 p-3 text-white hover:bg-gray-800 disabled:opacity-40"
                aria-label="Next flashcard"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          )}
        </div>

        {/* Known & Review Sections */}
        <div className="flex flex-col md:flex-row gap-4 mt-6 h-[40%] max-w-full overflow-hidden">
          <section
            className="flex-1 overflow-hidden rounded-2xl border border-green-300 bg-green-50 p-4 shadow-sm transition hover:shadow-md max-h-[calc(40vh-56px)]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, setKnownCards, "known")}
            aria-label="Known flashcards"
            role="region"
          >
            <h2 className="mb-2 text-base font-semibold text-green-800">I know these ✅</h2>
            <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[calc(40vh-96px)] pr-1">
              {knownCards.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleReAddCard(c, setKnownCards)}
                  className="text-left"
                  aria-label={`Re-add flashcard ${c.front}`}
                >
                  <Flashcard id={c.id} front={c.front} back={c.back} flipped={false} onFlip={() => {}} small />
                </button>
              ))}
            </div>
          </section>

          <section
            className="flex-1 overflow-hidden rounded-2xl border border-red-300 bg-red-50 p-4 shadow-sm transition hover:shadow-md max-h-[calc(40vh-56px)]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, setReviewCards, "review")}
            aria-label="Review flashcards"
            role="region"
          >
            <h2 className="mb-2 text-base font-semibold text-red-800">Review later 🕓</h2>
            <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[calc(40vh-96px)] pr-1">
              {reviewCards.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleReAddCard(c, setReviewCards)}
                  className="text-left"
                  aria-label={`Re-add flashcard ${c.front}`}
                >
                  <Flashcard id={c.id} front={c.front} back={c.back} flipped={false} onFlip={() => {}} small />
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
