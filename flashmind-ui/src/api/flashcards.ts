import type {Flashcard} from "../types/types";
export async function generateDummy(notes: string): Promise<{ front: string; back: string }[]> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  const data = await res.json();
  if (!res.ok || !Array.isArray(data.cards)) {
    throw new Error(data.error ?? "Failed to fetch dummy flashcards");
  }
  return data.cards;
}

export async function generate(notes: string) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  const data = await res.json();
  if (!res.ok || !Array.isArray(data.cards)) {
    throw new Error(data.error ?? "Failed to fetch dummy flashcards");
  }
  return data.cards as { front: string; back: string }[];
}

export async function saveFlashcards(chatId: string, lectureId: string, flashcards: { front: string; back: string }[]) {
  const res = await fetch(`/api/chats/${chatId}/lecture/${lectureId}/flashcards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ flashcards }),
  });
  if (!res.ok) throw new Error("Failed to save flashcards");
  return res.json();
}

export async function updateFlashcard(chatId: string, lectureId: string, flashcardId: string, data: { isKnown: boolean, isReview: boolean }) {
  const res = await fetch(`/api/chats/${chatId}/lecture/${lectureId}/flashcards/${flashcardId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update flashcard");
  return res.json();
}

export async function getFlashcards(chatId: string, lectureId: string): Promise<Flashcard[]> {
  const res = await fetch(`/api/chats/${chatId}/lecture/${lectureId}/flashcards`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch flashcards");
  return await res.json();
}
