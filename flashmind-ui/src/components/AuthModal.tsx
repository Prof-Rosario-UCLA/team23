import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  mode?: "login" | "signup";
};

export default function AuthModal({
  isOpen,
  onClose,
  anchorRef,
  mode: initialMode = "login",
}: AuthModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !anchorRef.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await signup(username, password);
      }
      onClose();
      navigate("/users/me");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <section
      ref={panelRef}
      className="absolute top-14 right-4 bg-white border border-gray-200 rounded shadow-lg w-72 p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-heading"
    >
      <form onSubmit={handleSubmit}>
        <header>
          <h2
            id="auth-modal-heading"
            className="text-sm font-semibold mb-2 text-gray-800"
          >
            {mode === "login" ? "Log In" : "Sign Up"}
          </h2>
        </header>

        <main>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-2 p-2 text-sm border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-3 p-2 text-sm border border-gray-300 rounded"
            required
          />
        </main>

        <footer>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700"
          >
            {mode === "login" ? "Log In" : "Sign Up"}
          </button>

          {error && (
            <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
          )}

          <p
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-xs mt-3 text-blue-600 cursor-pointer text-center"
          >
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Log in"}
          </p>
        </footer>
      </form>
    </section>
  );
}
