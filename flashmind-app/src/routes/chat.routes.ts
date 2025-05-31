import express from "express";
import Chat from "../models/Chat";
import Lecture from "../models/Lecture";
import Flashcard from "../models/Flashcard";

const router = express.Router();

// POST /api/chats -> create a new chat
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const chat = await Chat.create({ name });
    res.status(201).json({ id: chat._id.toString(), name: chat.name });
  } catch (err) {
    res.status(500).json({ error: "Failed to create chat" });
  }
});

// GET /api/chats -> return all chats
router.get("/", async (_req, res) => {
  try {
    const chats = await Chat.find();
    const result = chats.map(chat => ({
      id: chat._id.toString(),
      name: chat.name,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// POST /api/chats/:chatId/lecture -> create a lecture for the chat
router.post("/:chatId/lecture", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { lecture } = req.body;
    const newLecture = await Lecture.create({
      chatId,
      name: lecture,
      notes: "",
    });
    res.status(201).json({
      id: newLecture._id.toString(),
      name: newLecture.name,
      chatId: newLecture.chatId.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create lecture" });
  }
});

// GET /api/chats/:chatId/lecture -> return all lectures for the chat
router.get("/:chatId/lecture", async (req, res) => {
  try {
    const { chatId } = req.params;
    const lectures = await Lecture.find({ chatId });
    const result = lectures.map(lec => ({
      id: lec._id.toString(),
      name: lec.name,
      chatId: lec.chatId.toString(),
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch lectures" });
  }
});

// GET /api/chats/:chatId/lecture/:lectureId/flashcards -> return flashcards
router.get("/:chatId/lecture/:lectureId/flashcards", async (req, res) => {
  try {
    const { lectureId } = req.params;
    const flashcards = await Flashcard.find({ lectureId });
    const result = flashcards.map(fc => ({
      id: fc._id.toString(),
      front: fc.front,
      back: fc.back,
      isKnown: fc.isKnown,
      isReview: fc.isReview,
      lectureId: fc.lectureId.toString(),
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch flashcards" });
  }
});

export default router;
