import React from "react";

interface FlashcardProps {
  front: string;
  back: string;
  flipped: boolean;
  onFlip: () => void;
}

export default function Flashcard({ front, back, flipped, onFlip }: FlashcardProps) {
  return (
    <article
      role="button"
      draggable
      onDragStart={(e) => {
        // serialize the card data so drop zones can read it
        e.dataTransfer.setData(
          "application/json",
          JSON.stringify({ front, back })
        );
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={onFlip}
      className="relative w-full max-w-lg cursor-pointer select-none overflow-hidden rounded-3xl bg-white p-14 text-center shadow-xl transition hover:shadow-2xl active:scale-95"
    >
      <header className="min-h-[6rem] text-2xl font-semibold text-gray-800">
        {flipped ? back : front}
      </header>
      <footer className="pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-red-600 text-center text-sm tracking-wide text-white">
        <span className="leading-[3rem]">
          {flipped ? "Click again for the question \uD83D\uDC48" : "Click the card to flip \uD83D\uDC49"}
        </span>
      </footer>
    </article>
  );
}