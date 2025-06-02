import React, { useState, useEffect } from "react";
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

  const handleSubmit = async () => {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {mode === "login" ? "Log in to your account" : "Create an account"}
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 p-3 border border-gray-300 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 border border-gray-300 rounded"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm"
        >
          {mode === "login" ? "Log in" : "Sign up"}
        </button>

        {error && (
          <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
        )}

        <p className="text-sm text-center mt-4">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            className="text-green-700 underline"
            onClick={() =>
              navigate(`/?mode=${mode === "login" ? "signup" : "login"}`)
            }
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-200" />
          <span className="mx-3 text-gray-400 text-sm">OR</span>
          <hr className="flex-grow border-gray-200" />
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-center border rounded py-2 hover:bg-gray-100">
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
            Continue with Google
          </button>

        </div>
      </div>
    </div>
  );
}
