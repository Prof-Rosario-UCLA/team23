import { useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-gray-900 text-white p-4 text-sm flex justify-between items-center z-50 shadow-md">
      <span>
        This site uses cookies to enhance user experience. By continuing, you agree to our use of cookies.
      </span>
      <button
        onClick={() => setVisible(false)}
        className="ml-4 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
      >
        Got it
      </button>
    </div>
  );
}
