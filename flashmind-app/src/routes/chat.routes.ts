import express from "express";
import Chat from "../models/Chat";
import Lecture from "../models/Lecture";
import Flashcard from "../models/Flashcard";
import { authenticateJWT } from "../middleware/auth";
import redisClient from "../utils/cache";

const router = express.Router();
router.use(authenticateJWT);

// POST /api/chats
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user!.id;

    const chat = await Chat.create({ name, userId });
    await redisClient.del(`chats:${userId}`);
    console.log(`🗑️ Evicted cache: chats:${userId}`);

    res.status(201).json({ id: chat._id.toString(), name: chat.name });
  } catch {
    res.status(500).json({ error: "Failed to create chat" });
  }
});

// GET /api/chats
router.get("/", async (req, res) => {
  const userId = req.user!.id;
  const cacheKey = `chats:${userId}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return res.json(JSON.parse(cached));
    }

    const chats = await Chat.find({ userId });
    const result = chats.map(chat => ({
      id: chat._id.toString(),
      name: chat.name,
    }));

    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 60 });
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// POST /:chatId/lectures
router.post("/:chatId/lectures", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { lecture } = req.body;
    const userId = req.user!.id;

    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) return res.status(403).json({ error: "Unauthorized access to chat" });

    const newLecture = await Lecture.create({ chatId, name: lecture, notes: "" });

    await redisClient.del(`chat:lectures:${chatId}`);
    console.log(`🗑️ Evicted cache: chat:lectures:${chatId}`);

    res.status(201).json({
      id: newLecture._id.toString(),
      name: newLecture.name,
      chatId: newLecture.chatId.toString(),
    });
  } catch {
    res.status(500).json({ error: "Failed to create lecture" });
  }
});

// GET /:chatId/lectures
router.get("/:chatId/lectures", async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user!.id;
  const cacheKey = `chat:lectures:${chatId}`;

  try {
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) return res.status(403).json({ error: "Unauthorized access to chat" });

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return res.json(JSON.parse(cached));
    }

    const lectures = await Lecture.find({ chatId });
    const result = lectures.map(lec => ({
      id: lec._id.toString(),
      name: lec.name,
      notes: lec.notes || "",
      chatId: lec.chatId.toString(),
    }));

    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 60 });
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch lectures" });
  }
});

// GET /:chatId/lecture/:lectureId
router.get("/:chatId/lecture/:lectureId", async (req, res) => {
  const { chatId, lectureId } = req.params;
  const userId = req.user!.id;
  const cacheKey = `lecture:${lectureId}`;

  try {
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) return res.status(403).json({ error: "Unauthorized access to chat" });

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return res.json(JSON.parse(cached));
    }

    const lecture = await Lecture.findOne({ _id: lectureId, chatId });
    if (!lecture) return res.status(404).json({ error: "Lecture not found" });

    const flashcards = await Flashcard.find({ lectureId });

    const result = {
      id: lecture._id.toString(),
      name: lecture.name,
      notes: lecture.notes || "",
      chatId: lecture.chatId.toString(),
      flashcards: flashcards.map(fc => ({
        id: fc._id.toString(),
        front: fc.front,
        back: fc.back,
        isKnown: fc.isKnown,
        isReview: fc.isReview,
        lectureId: fc.lectureId.toString(),
      })),
    };

    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 60 });
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch lecture" });
  }
});

// GET /:chatId/lecture/:lectureId/flashcards
router.get("/:chatId/lecture/:lectureId/flashcards", async (req, res) => {
  const { chatId, lectureId } = req.params;
  const userId = req.user!.id;
  const cacheKey = `flashcards:${lectureId}`;

  try {
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) return res.status(403).json({ error: "Unauthorized access to chat" });

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return res.json(JSON.parse(cached));
    }

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
  } catch {
    res.status(500).json({ error: "Failed to fetch flashcards" });
  }
});

// PATCH /:chatId/lecture/:lectureId
router.patch("/:chatId/lecture/:lectureId", async (req, res) => {
  const { chatId, lectureId } = req.params;
  const { notes } = req.body;
  const userId = req.user!.id;

  try {
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) return res.status(403).json({ error: "Unauthorized access to chat" });

    const lecture = await Lecture.findOneAndUpdate(
      { _id: lectureId, chatId },
      { notes },
      { new: true }
    );
    if (!lecture) return res.status(404).json({ error: "Lecture not found" });

    await redisClient.del(`chat:lectures:${chatId}`);
    await redisClient.del(`lecture:${lectureId}`);
    console.log(`🗑️ Evicted cache: chat:lectures:${chatId}, lecture:${lectureId}`);

    res.json({
      id: lecture._id.toString(),
      name: lecture.name,
      notes: lecture.notes,
      chatId: lecture.chatId.toString(),
    });
  } catch {
    res.status(500).json({ error: "Failed to update lecture" });
  }
});

// POST /:chatId/lecture/:lectureId/flashcards
router.post("/:chatId/lecture/:lectureId/flashcards", async (req, res) => {
  const { chatId, lectureId } = req.params;
  const { flashcards } = req.body;
  const userId = req.user!.id;

  try {
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) return res.status(403).json({ error: "Unauthorized access to chat" });

    const inserted = await Flashcard.insertMany(
      flashcards.map((fc: any) => ({
        lectureId,
        front: fc.front,
        back: fc.back,
        isKnown: false,
        isReview: false,
      }))
    );

    await redisClient.del(`flashcards:${lectureId}`);
    await redisClient.del(`chat:lectures:${chatId}`);
    await redisClient.del(`lecture:${lectureId}`);
    console.log(`🗑️ Evicted cache: flashcards:${lectureId}, chat:lectures:${chatId}, lecture:${lectureId}`);

    res.status(201).json(inserted.map(fc => ({
      id: fc._id.toString(),
      front: fc.front,
      back: fc.back,
      isKnown: fc.isKnown,
      isReview: fc.isReview,
      lectureId: fc.lectureId.toString(),
    })));
  } catch {
    res.status(500).json({ error: "Failed to save flashcards" });
  }
});

// PATCH /:chatId/lecture/:lectureId/flashcards/:flashcardId
router.patch("/:chatId/lecture/:lectureId/flashcards/:flashcardId", async (req, res) => {
  const { chatId, lectureId, flashcardId } = req.params;
  const { isKnown, isReview } = req.body;
  const userId = req.user!.id;

  try {
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) return res.status(403).json({ error: "Unauthorized access to chat" });

    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: flashcardId, lectureId },
      { isKnown, isReview },
      { new: true }
    );
    if (!flashcard) return res.status(404).json({ error: "Flashcard not found" });

    await redisClient.del(`flashcards:${lectureId}`);
    await redisClient.del(`chat:lectures:${chatId}`);
    await redisClient.del(`lecture:${lectureId}`);
    console.log(`🗑️ Evicted cache: flashcards:${lectureId}, chat:lectures:${chatId}, lecture:${lectureId}`);

    res.json({
      id: flashcard._id.toString(),
      front: flashcard.front,
      back: flashcard.back,
      isKnown: flashcard.isKnown,
      isReview: flashcard.isReview,
      lectureId: flashcard.lectureId.toString(),
    });
  } catch {
    res.status(500).json({ error: "Failed to update flashcard" });
  }
});

export default router;
