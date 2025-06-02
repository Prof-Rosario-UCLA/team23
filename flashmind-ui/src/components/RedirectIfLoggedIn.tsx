// src/components/RedirectIfLoggedIn.tsx
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import type { JSX } from "react";


export default function RedirectIfLoggedIn({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? <Navigate to="/users/me" replace /> : children;
}
