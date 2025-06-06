import { useState } from "react";
import { Plus } from "lucide-react";

type Props = {
  onCreateChat: (name: string, tempId: string) => Promise<void>;
};

export default function NoChatScreen({ onCreateChat }: Props) {
  const [name, setName] = useState("");

  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    const tempId = `temp-${Date.now()}`;
    await onCreateChat(name, tempId);
    setName("");
  };

  return (
    <main className="flex h-full w-full items-center justify-center bg-white">
      <section className="text-center space-y-4" aria-label="Create your first chat">
        <h2 className="text-xl font-semibold text-gray-800">No chats yet</h2>
        <p className="text-sm text-gray-500">Start by creating your first chat.</p>
        <form
          onSubmit={handleAdd}
          className="flex items-center justify-center gap-2"
        >
          <label htmlFor="chat-name" className="sr-only">
            Chat name
          </label>
          <input
            id="chat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chat name"
            className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            aria-label="Add new chat"
            className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Chat
          </button>
        </form>
      </section>
    </main>
  );
}
