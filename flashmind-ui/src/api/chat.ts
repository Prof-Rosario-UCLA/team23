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
  name: string;
  notes: string;
  flashcards: Flashcard[];
};

export type ChatSession = {
  id: string;
  name: string;
  lectures: Lecture[];
};

// ✅ Fetch all chats and their lectures (without flashcards for performance)
export async function getChats(): Promise<ChatSession[]> {
  const res = await fetch("/api/chats", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch chats");

  const rawChats = await res.json();

  const chatsWithLectures: ChatSession[] = await Promise.all(
    rawChats.map(async (chat: any) => {
      try {
        const lecRes = await fetch(`/api/chats/${chat.id}/lecture`, {
          credentials: "include",
          cache: "no-store",
        });
        const rawLectures = lecRes.ok ? await lecRes.json() : [];

        const lectures: Lecture[] = rawLectures.map((lec: any) => ({
          ...lec,
          notes: lec.notes || "",
          flashcards: [],
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

// ✅ Create a new chat
export async function createChat(name: string): Promise<ChatSession> {
  const res = await fetch("/api/chats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create chat");
  return await res.json();
}

// ✅ Create a new lecture in a chat
export async function createLecture(chatId: string, lecture: string): Promise<Lecture> {
  const res = await fetch(`/api/chats/${chatId}/lecture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ lecture }),
  });
  if (!res.ok) throw new Error("Failed to create lecture");
  const lec = await res.json();
  return { ...lec, notes: lec.notes || "", flashcards: [] };
}

// ✅ Get all lectures for a chat
export async function getLectures(chatId: string): Promise<Lecture[]> {
  const res = await fetch(`/api/chats/${chatId}/lecture`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch lectures");

  const rawLectures = await res.json();
  return rawLectures.map((lec: any) => ({
    ...lec,
    notes: lec.notes || "",
    flashcards: [],
  }));
}

// ✅ Get all flashcards for a lecture
export async function getFlashcards(chatId: string, lectureId: string): Promise<Flashcard[]> {
  const res = await fetch(`/api/chats/${chatId}/lecture/${lectureId}/flashcards`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch flashcards");
  return await res.json();
}
