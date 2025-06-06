import { useEffect, useState } from "react";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import type { ChatSession } from "./types/types";
import LecturePage from "./features/LecturePage";
import { getChats, createChat, createLecture } from "./api/chat";
import NoLectureScreen from "./features/NoLectureScreen";
import NoChatScreen from "./features/NoChatScreen";
import AuthPage from "./features/AuthPage";
import CookieBanner from "./components/CookieBanner";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, loading } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await getChats();
        setChats(data);

        if (data.length > 0) {
          setSelectedChatId(data[0].id);
          if (data[0].lectures.length > 0) {
            setSelectedLectureId(data[0].lectures[0].id);
          }
        } else {
          setSelectedChatId(null);
          setSelectedLectureId(null);
        }
      } catch (err) {
        console.error("Failed to fetch chats", err);
        setChats([]);
        setSelectedChatId(null);
        setSelectedLectureId(null);
      }
    })();
  }, [user]);

  const handleAddLecture = async (chatId: string, name: string, tempId: string) => {
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

  const handleAddChat = async (name: string, tempId: string) => {
    const newChat = await createChat(name);
    setChats([{ ...newChat, lectures: [] }]);
    setSelectedChatId(newChat.id);
    setSelectedLectureId(null);
  };

  const currentChat = chats.find((c) => c.id === selectedChatId);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
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
          setChats={setChats}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        {user && (
          <div className="absolute top-4 left-2 z-10">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded bg-gray-200 p-2 shadow hover:bg-gray-300"
            >
              {sidebarOpen ? <PanelLeftOpen className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-gray-100">
          {loading ? (
            <div className="h-full flex items-center justify-center">Loading…</div>
          ) : !user ? (
            <div className="h-full flex items-center justify-center bg-white">
              <div className="max-w-md w-full">
                <AuthPage />
              </div>
            </div>
          ) : chats.length === 0 ? (
            <NoChatScreen onCreateChat={handleAddChat} />
          ) : selectedChatId && selectedLectureId ? (
            <LecturePage
              chatId={selectedChatId}
              chatName={currentChat?.name || "Untitled Chat"}
              lectureId={selectedLectureId}
              lectureName={
                currentChat?.lectures.find((l) => l.id === selectedLectureId)?.name ||
                "Untitled Lecture"
              }
            />
          ) : selectedChatId && currentChat?.lectures.length === 0 ? (
            <NoLectureScreen chatId={selectedChatId} onCreateLecture={handleAddLecture} />
          ) : null}
        </div>
      </div>
      {user && <CookieBanner />}
    </div>
  );
}
