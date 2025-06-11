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

app.get("/healthz", (_req, res) => res.sendStatus(200));

app.get(["/", "/index.html"], (req, res, next) => {
  res.set("Cache-Control", "no-store, max-age=0");
  next();
});

// Serve React’s build output
const staticDir = path.resolve(__dirname, "../frontend/dist");
console.log(">> __dirname =", __dirname);
console.log("Static assets served from:", staticDir);
app.use(express.static(staticDir));


// Middleware
app.use(cors({ origin: "https://team23.cs144.org", credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/generate", generateRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/auth", authRoutes);

app.get("/*", (req, res, next) => {
  if (req.path.startsWith("/api/") ||
      path.extname(req.path)) {
    return next();
  }
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Start server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server listening on port ${PORT}`);
});
