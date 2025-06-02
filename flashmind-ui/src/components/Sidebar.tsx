import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createChat, createLecture } from "../api/chat";
import { MessageCircle, FileText } from "lucide-react";
import { PanelLeftOpen } from "lucide-react";

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  lectureId: string;
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

type SidebarProps = {
  chats: ChatSession[];
  selectedChatId: string | null;
  selectedLectureId: string | null;
  setSelectedChatId: (id: string) => void;
  setSelectedLectureId: (id: string | null) => void;
  setChats: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  onAddChat: (name: string, tempId: string) => Promise<void>;
  onAddLecture: (chatId: string, name: string, tempId: string) => Promise<void>;
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({
  chats,
  selectedChatId,
  selectedLectureId,
  setSelectedChatId,
  setSelectedLectureId,
  setChats,
  setSidebarOpen,
}: SidebarProps) {
  const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set());
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingLecture, setEditingLecture] = useState<{
    chatId: string;
    lectureId: string;
  } | null>(null);
  const newLectureIdRef = useRef<string | null>(null);
  const cancelNextLectureSubmitRef = useRef(false);

  useEffect(() => {
    if (newLectureIdRef.current) {
      for (const chat of chats) {
        if (chat.lectures.find((l) => l.id === newLectureIdRef.current)) {
          setEditingLecture({
            chatId: chat.id,
            lectureId: newLectureIdRef.current,
          });
          newLectureIdRef.current = null;
          break;
        }
      }
    }
  }, [chats]);

  const handleChatNameSubmit = async (tempId: string, name: string) => {
    const newChat = await createChat(name);
    setChats((prev) =>
      prev.map((c) => (c.id === tempId ? { ...newChat, lectures: [] } : c))
    );
    setSelectedChatId(newChat.id);
    setSelectedLectureId(null);
    setExpandedChats((prev) => new Set(prev).add(newChat.id));
    setEditingChatId(null);

    setTimeout(() => {
      document
        .getElementById(newChat.id)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleChatNameChange = (id: string, newName: string) => {
    if (id.startsWith("temp-")) {
      handleChatNameSubmit(id, newName);
    } else {
      setChats((prev) =>
        prev.map((chat) => (chat.id === id ? { ...chat, name: newName } : chat))
      );
      setEditingChatId(null);
    }
  };

  const handleLectureNameSubmit = async (
    chatId: string,
    tempId: string,
    name: string
  ) => {
    if (cancelNextLectureSubmitRef.current) {
      cancelNextLectureSubmitRef.current = false;
      return;
    }

    if (tempId.startsWith("temp-")) {
      const newLecture = await createLecture(chatId, name);
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                lectures: chat.lectures.map((lec) =>
                  lec.id === tempId ? { ...newLecture, flashcards: [] } : lec
                ),
              }
            : chat
        )
      );
      setSelectedChatId(chatId);
      setSelectedLectureId(newLecture.id);
      setExpandedChats((prev) => new Set(prev).add(chatId));

      setTimeout(() => {
        document
          .getElementById(newLecture.id)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } else {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                lectures: chat.lectures.map((lec) =>
                  lec.id === tempId ? { ...lec, name } : lec
                ),
              }
            : chat
        )
      );
    }
    setEditingLecture(null);
  };

  return (
    <nav className="w-full h-full bg-white p-4" aria-label="Chat sidebar">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {setSidebarOpen && (
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="rounded bg-gray-200 p-1 shadow hover:bg-gray-300"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-800">Chats</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            const tempId = `temp-${Date.now()}`;
            setChats((prev) => [
              ...prev,
              { id: tempId, name: "", lectures: [] },
            ]);
            setEditingChatId(tempId);
            setExpandedChats((prev) => new Set(prev).add(tempId));
          }}
          className="text-gray-500 hover:text-black text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </header>

      <ul className="space-y-1">
        <AnimatePresence>
          {chats.map((chat) => {
            const expanded = expandedChats.has(chat.id);
            const isTemp = chat.id.startsWith("temp-");

            return (
              <motion.li
                key={chat.id}
                id={chat.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.5 }}
              >
                <section>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      const copy = new Set(expandedChats);
                      copy.has(chat.id)
                        ? copy.delete(chat.id)
                        : copy.add(chat.id);
                      setExpandedChats(copy);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const copy = new Set(expandedChats);
                        copy.has(chat.id)
                          ? copy.delete(chat.id)
                          : copy.add(chat.id);
                        setExpandedChats(copy);
                      }
                    }}
                    className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer transition ${
                      selectedChatId === chat.id
                        ? "bg-gray-100 font-semibold text-black"
                        : "hover:bg-gray-100 text-gray-800"
                    }`}
                  >
                    {editingChatId === chat.id ? (
                      <div className="flex items-center w-full gap-2">
                        <input
                          autoFocus
                          defaultValue={chat.name}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleChatNameChange(
                                chat.id,
                                (e.target as HTMLInputElement).value
                              );
                            }
                          }}
                          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            if (chat.id.startsWith("temp-")) {
                              setChats((prev) =>
                                prev.filter((c) => c.id !== chat.id)
                              );
                            }
                            setEditingChatId(null);
                          }}
                          className="text-sm text-gray-500 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-gray-500" />
                        {chat.name || "Untitled"}
                      </span>
                    )}
                    {expanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.ul
                        className="pl-4"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        <AnimatePresence>
                          {chat.lectures.map((lec) => {
                            const isEditing =
                              editingLecture?.lectureId === lec.id &&
                              editingLecture?.chatId === chat.id;

                            return (
                              <motion.li
                                key={lec.id}
                                id={lec.id}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{
                                  duration: 0.5,
                                  ease: "easeInOut",
                                }}
                              >
                                {isEditing ? (
                                  <div className="flex items-center justify-between px-2 py-1">
                                    <input
                                      autoFocus
                                      defaultValue={lec.name}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleLectureNameSubmit(
                                            chat.id,
                                            lec.id,
                                            (e.target as HTMLInputElement).value
                                          );
                                        }
                                      }}
                                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        cancelNextLectureSubmitRef.current =
                                          true;
                                        if (lec.id.startsWith("temp-")) {
                                          setChats((prev) =>
                                            prev.map((c) =>
                                              c.id === chat.id
                                                ? {
                                                    ...c,
                                                    lectures: c.lectures.filter(
                                                      (l) => l.id !== lec.id
                                                    ),
                                                  }
                                                : c
                                            )
                                          );
                                        }
                                        setEditingLecture(null);
                                      }}
                                      className="ml-2 text-sm text-gray-500 hover:text-red-600"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedChatId(chat.id);
                                      setSelectedLectureId(lec.id);
                                    }}
                                    className={`block w-full text-left px-4 py-1.5 text-sm rounded-md transition ${
                                      selectedLectureId === lec.id
                                        ? "bg-blue-100 text-blue-800 font-semibold"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-gray-400" />
                                      {lec.name}
                                    </span>
                                  </button>
                                )}
                              </motion.li>
                            );
                          })}
                        </AnimatePresence>

                        <li>
                          <button
                            type="button"
                            disabled={isTemp}
                            onClick={() => {
                              const tempId = `temp-${chat.id}-${Date.now()}`;
                              newLectureIdRef.current = tempId;
                              setEditingLecture({
                                chatId: chat.id,
                                lectureId: tempId,
                              });
                              setChats((prev) =>
                                prev.map((c) =>
                                  c.id === chat.id
                                    ? {
                                        ...c,
                                        lectures: [
                                          ...c.lectures,
                                          {
                                            id: tempId,
                                            name: "",
                                            flashcards: [],
                                          },
                                        ],
                                      }
                                    : c
                                )
                              );
                              setExpandedChats((prev) =>
                                new Set(prev).add(chat.id)
                              );
                            }}
                            className={`w-full text-left px-4 py-1.5 text-sm flex items-center gap-1 ${
                              isTemp
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-blue-600 hover:text-blue-800"
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                            New Lecture
                          </button>
                        </li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </section>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </nav>
  );
}
