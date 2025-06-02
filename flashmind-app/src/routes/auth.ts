import express from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";

const router = express.Router();

// POST /api/signup
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

    res.status(201).json({ username: newUser.username });
  } catch (err) {
    res.status(500).json({ message: "Signup error" });
  }
});

// POST /api/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({ username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
});

export default router;
