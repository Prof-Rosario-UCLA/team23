import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [params] = useSearchParams();
  const mode = params.get("mode") !== "signup" ? "login" : "signup";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await signup(username, password);
      }
      navigate("/users/me");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <section
        className="w-full max-w-md p-6 bg-white rounded shadow-md"
        aria-label={mode === "login" ? "Login form" : "Signup form"}
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          {mode === "login" ? "Log in to your account" : "Create an account"}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm"
          >
            {mode === "login" ? "Log in" : "Sign up"}
          </button>

          {error && (
            <p className="text-red-500 text-xs mt-2 text-center" role="alert">
              {error}
            </p>
          )}
        </form>

        <p className="text-sm text-center mt-4">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="text-green-700 underline"
            onClick={() =>
              navigate(`/?mode=${mode === "login" ? "signup" : "login"}`)
            }
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </section>
    </main>
  );
}
