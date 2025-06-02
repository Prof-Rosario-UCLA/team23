import { RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

export const authenticateJWT: RequestHandler = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (typeof payload !== "object" || !payload.id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    req.user = { id: payload.id };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};