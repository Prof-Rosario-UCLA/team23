import express from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateJWT } from "../middleware/auth";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production", // false in dev
};

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(409).json({ message: "Username taken" });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, passwordHash });

    const token = jwt.sign({ id: newUser._id.toString() }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, COOKIE_OPTIONS).status(201).json({
      message: "Signup successful",
      username: newUser.username,
    });
  } catch {
    res.status(500).json({ message: "Signup error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, COOKIE_OPTIONS).json({
      message: "Login successful",
      username: user.username,
    });
  } catch {
    res.status(500).json({ message: "Login error" });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

// GET /api/auth/me -> check if logged in
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ id: user._id.toString(), username: user.username });
  } catch {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;
