import express from "express";
import Chat from "../models/Chat";
import Lecture from "../models/Lecture";
import Flashcard from "../models/Flashcard";
import { authenticateJWT } from "../middleware/auth";
import redisClient from "../utils/cache";

const router = express.Router();

router.use(authenticateJWT);

// POST /api/chats -> create a new chat
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user!.id;

    const chat = await Chat.create({ name, userId });

    await redisClient.del(`chats:${userId}`);

    res.status(201).json({ id: chat._id.toString(), name: chat.name });
  } catch (err) {
    res.status(500).json({ error: "Failed to create chat" });
  }
});

// GET /api/chats -> return all chats for this user
router.get("/", async (req, res) => {
  const userId = req.user!.id;
  const cacheKey = `chats:${userId}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for ${cacheKey}`);
      return res.json(JSON.parse(cached));
    }

    const chats = await Chat.find({ userId });
    const result = chats.map(chat => ({
      id: chat._id.toString(),
      name: chat.name,
    }));

    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 60 });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// POST /api/chats/:chatId/lecture -> create a lecture under this chat
router.post("/:chatId/lecture", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { lecture } = req.body;
    const userId = req.user!.id;

    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) return res.status(403).json({ error: "Unauthorized access to chat" });

    const newLecture = await Lecture.create({
      chatId,
      name: lecture,
      notes: "",
    });

    await redisClient.del(`lectures:${chatId}`);

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
  const { chatId } = req.params;
  const userId = req.user!.id;
  const cacheKey = `lectures:${chatId}`;

  try {
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) return res.status(403).json({ error: "Unauthorized access to chat" });

    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const lectures = await Lecture.find({ chatId });
    const result = lectures.map(lec => ({
      id: lec._id.toString(),
      name: lec.name,
      chatId: lec.chatId.toString(),
    }));

    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 60 });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch lectures" });
  }
});

// GET /api/chats/:chatId/lecture/:lectureId/flashcards
router.get("/:chatId/lecture/:lectureId/flashcards", async (req, res) => {
  const { chatId, lectureId } = req.params;
  const userId = req.user!.id;
  const cacheKey = `flashcards:${lectureId}`;

  try {
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) return res.status(403).json({ error: "Unauthorized access to chat" });

    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const flashcards = await Flashcard.find({ lectureId });
    const result = flashcards.map(fc => ({
      id: fc._id.toString(),
      front: fc.front,
      back: fc.back,
      isKnown: fc.isKnown,
      isReview: fc.isReview,
      lectureId: fc.lectureId.toString(),
    }));

    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 60 });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch flashcards" });
  }
});

export default router;
