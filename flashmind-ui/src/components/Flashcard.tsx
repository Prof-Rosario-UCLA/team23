interface FlashcardProps {
  id: string;
  front: string;
  back: string;
  flipped: boolean;
  onFlip: () => void;
  small?: boolean;
}

export default function Flashcard({
  id,
  front,
  back,
  flipped,
  onFlip,
  small = false,
}: FlashcardProps) {
  const text = flipped ? back : front;
  const displayText = text.length > 100 ? text.slice(0, 100) + "…" : text;

  const getFontSize = () => {
    if (small) return "text-xs";
    if (displayText.length > 80) return "text-base";
    if (displayText.length > 50) return "text-lg";
    return "text-2xl";
  };

  return (
    <article
      role="button"
      draggable={!small}
      aria-label={`Flashcard ${flipped ? "answer" : "question"}`}
      onDragStart={(e) => {
        if (small) return;
        const cardData = { front, back, id };
        e.dataTransfer.setData("application/json", JSON.stringify(cardData));
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={onFlip}
      className={`relative cursor-pointer select-none overflow-hidden rounded-2xl bg-white ${
        small ? "p-3 shadow-md text-sm w-full" : "p-14 shadow-xl max-w-lg w-full"
      } text-center transition hover:shadow-2xl active:scale-95`}
    >
      <section
        className={`min-h-[3rem] text-gray-800 break-words ${getFontSize()}`}
      >
        {displayText}
      </section>

      {!small && (
        <footer className="pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-emerald-600 text-center text-sm tracking-wide text-white">
          <p className="leading-[3rem]">
            {flipped
              ? "Click again for the question \uD83D\uDC48"
              : "Click the card to flip \uD83D\uDC49"}
          </p>
        </footer>
      )}
    </article>
  );
}
