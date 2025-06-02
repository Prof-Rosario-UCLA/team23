import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import connectDB from "./utils/connectDb";
import generateRoutes from "./routes/generate.routes";
import chatRoutes from "./routes/chat.routes";
import authRoutes from "./routes/auth";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(helmet());
app.use(express.json());

// Routes
app.use("/api/generate", generateRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/auth", authRoutes);

// Start server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server listening on http://localhost:${PORT}`);
});
