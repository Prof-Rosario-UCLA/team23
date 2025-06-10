import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import "dotenv/config";
import connectDB from "./utils/connectDb";
import generateRoutes from "./routes/generate.routes";
import chatRoutes from "./routes/chat.routes";
import authRoutes from "./routes/auth";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3001;


// Serve React’s build output
app.use(express.static(path.join(__dirname, "../frontend/dist")));
// Fallback all other GETs to index.html so React Router works
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});


app.get("/healthz", (_req, res) => res.sendStatus(200));
app.get("/",      (_req, res) => res.send("OK"));

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/generate", generateRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/auth", authRoutes);

// Start server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server listening on http://localhost:${PORT}`);
});
