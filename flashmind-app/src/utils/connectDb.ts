import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI not set in environment");
  }
  await mongoose.connect(uri);
  console.log("✅ MongoDB connected");
}

export default connectDB;
