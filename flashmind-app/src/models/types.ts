export interface FlashcardDTO {
  id: string;
  lectureId: string;
  front: string;
  back: string;
}

export interface LectureDTO {
  id: string;
  chatId: string;
  title: string;
  notes: string;
  flashcards?: FlashcardDTO[];
}

export interface ChatDTO {
  id: string;
  name: string;
  lectures?: LectureDTO[];
}
