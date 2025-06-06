export interface FlashcardDTO {
  id: string;
  lectureId: string;
  front: string;
  back: string;
  isKnown?: boolean;
  isReview?: boolean;
}

export interface LectureDTO {
  id: string;
  chatId: string;
  name: string;
  notes: string;
  flashcards?: FlashcardDTO[];
}

export interface ChatDTO {
  id: string;
  name: string;
  lectures?: LectureDTO[];
}
