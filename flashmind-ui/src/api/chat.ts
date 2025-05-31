export type Flashcard = {
  id: string;
  front: string;
  back: string;
  isKnown: boolean;
  isReview: boolean;
  lectureId: string;
};

export type Lecture = {
  id: string;
  name: string; // was "title" before, now matches backend
  notes: string;
  flashcards: Flashcard[];
};

export type ChatSession = {
  id: string;
  name: string;
  lectures: Lecture[];
};



export async function getChats(): Promise<ChatSession[]> {
  const res = await fetch("/api/chats");
  if (!res.ok) throw new Error("Failed to fetch chats");

  const rawChats = await res.json();

  const chatsWithLectures: ChatSession[] = await Promise.all(
    rawChats.map(async (chat: any) => {
      try {
        const lecRes = await fetch(`/api/chats/${chat.id}/lecture`);
        const rawLectures = lecRes.ok ? await lecRes.json() : [];

        const lectures: Lecture[] = rawLectures.map((lec: any) => ({
          ...lec,
          flashcards: Array.isArray(lec.flashcards) ? lec.flashcards : [],
        }));

        return { ...chat, lectures };
      } catch (err) {
        console.error(`Failed to load lectures for chat ${chat.id}`, err);
        return { ...chat, lectures: [] };
      }
    })
  );

  return chatsWithLectures;
}


export async function createChat(name: string): Promise<ChatSession> {
  const res = await fetch("/api/chats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create chat");
  return await res.json();
}

export async function createLecture(chatId: string, lecture: string): Promise<Lecture> {
  const res = await fetch(`/api/chats/${chatId}/lecture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lecture }),
  });
  if (!res.ok) throw new Error("Failed to create lecture");
  return await res.json();
}

export async function getLectures(chatId: string): Promise<Lecture[]> {
  const res = await fetch(`/api/chats/${chatId}/lecture`);
  if (!res.ok) throw new Error("Failed to fetch lectures");
  return await res.json();
}

export async function getFlashcards(chatId: string, lectureId: string): Promise<Flashcard[]> {
  const res = await fetch(`/api/chats/${chatId}/lecture/${lectureId}/flashcards`);
  if (!res.ok) throw new Error("Failed to fetch flashcards");
  return await res.json();
}

