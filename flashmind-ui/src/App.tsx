import { useEffect, useState } from "react";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import type { ChatSession } from "./components/Sidebar";
import LecturePage from "./features/LecturePage";
import { getChats, createChat, createLecture } from "./api/chat";
import NoLectureScreen from "./features/NoLectureScreen";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(
    null
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await getChats();
        if (!Array.isArray(data)) throw new Error("Invalid response");

        setChats(data);

        if (data.length > 0) {
          setSelectedChatId(data[0].id);
          if (Array.isArray(data[0].lectures) && data[0].lectures.length > 0) {
            setSelectedLectureId(data[0].lectures[0].id);
          } else {
            setSelectedLectureId(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch chats", err);
        setChats([]);
        setSelectedChatId(null);
        setSelectedLectureId(null);
      }
    })();
  }, []);

  const handleAddChat = async (name: string, tempId: string) => {
    const newChat = await createChat(name);
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === tempId ? { ...newChat, lectures: [] } : chat
      )
    );
    setSelectedChatId(newChat.id);
    setSelectedLectureId(null);
  };

  const handleAddLecture = async (
    chatId: string,
    name: string,
    tempId: string
  ) => {
    const newLecture = await createLecture(chatId, name);
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lectures: chat.lectures.some((lec) => lec.id === tempId)
                ? chat.lectures.map((lec) =>
                    lec.id === tempId ? { ...newLecture, flashcards: [] } : lec
                  )
                : [...chat.lectures, { ...newLecture, flashcards: [] }],
            }
          : chat
      )
    );
    setSelectedChatId(chatId);
    setSelectedLectureId(newLecture.id);
  };

  const currentChat = chats.find((c) => c.id === selectedChatId);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (left column) */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden border-r border-gray-200 bg-white`}
      >
        <Sidebar
          chats={chats}
          selectedChatId={selectedChatId}
          selectedLectureId={selectedLectureId}
          setSelectedChatId={setSelectedChatId}
          setSelectedLectureId={setSelectedLectureId}
          onAddChat={handleAddChat}
          onAddLecture={handleAddLecture}
          setChats={setChats}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {/* Main content (right column) */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar spans only the main area */}
        <Navbar />

        {/* Optional: move the toggle inside the navbar or keep it here */}
        <div className="absolute top-4 left-2 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded bg-gray-200 p-2 shadow hover:bg-gray-300"
          >
            {sidebarOpen ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {selectedChatId && selectedLectureId ? (
            <LecturePage
              chatId={selectedChatId}
              chatName={currentChat?.name || "Untitled Chat"}
              lectureId={selectedLectureId}
              lectureName={
                currentChat?.lectures.find((l) => l.id === selectedLectureId)
                  ?.name || "Untitled Lecture"
              }
            />
          ) : selectedChatId &&
            Array.isArray(currentChat?.lectures) &&
            currentChat.lectures.length === 0 ? (
            <NoLectureScreen
              chatId={selectedChatId}
              onCreateLecture={handleAddLecture}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
