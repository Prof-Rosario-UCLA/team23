// src/types.ts
export type Flashcard = {
  id: string;
  front: string;
  back: string;
  lectureId: string;
  isKnown?: boolean;
  isReview?: boolean;
};

export type Lecture = {
  id: string;
  name: string;
  notes?: string;
  flashcards?: Flashcard[];
};

export type ChatSession = {
  id: string;
  name: string;
  lectures: Lecture[];
};
