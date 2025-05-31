import { useState } from "react";
import { Plus } from "lucide-react";

type Props = {
  chatId: string;
  onCreateLecture: (chatId: string, name: string, tempId: string) => Promise<void>;
};

export default function NoLectureScreen({ chatId, onCreateLecture }: Props) {
  const [name, setName] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) return;
    const tempId = `temp-${Date.now()}`;
    await onCreateLecture(chatId, name, tempId);
    setName("");
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">No lectures yet</h2>
        <p className="text-sm text-gray-500">Start by creating your first lecture for this chat.</p>
        <div className="flex items-center justify-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Lecture title"
            className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Lecture
          </button>
        </div>
      </div>
    </div>
  );
}
