// src/utils/connectDB.ts
import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  console.log("ℹ️  connectDB(): Reading MONGODB_URI from environment...");
  if (!uri) {
    console.error("❌ MONGODB_URI not set in environment");
    throw new Error("MONGODB_URI not set in environment");
  }
  console.log(`ℹ️  connectDB(): Attempting to connect to MongoDB at: ${uri}`);

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
    console.log(`   • Host:     ${mongoose.connection.host}`);
    console.log(`   • Port:     ${mongoose.connection.port}`);
    console.log(`   • Database: ${mongoose.connection.name}`);
  } catch (err) {
    console.error("❌ Mongoose.connect() threw an error:");
    console.error(err);
    throw err;
  }

  // Listen for any runtime connection errors
  mongoose.connection.on("error", (error) => {
    console.error("❌ Mongoose runtime connection error:", error);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  Mongoose default connection disconnected");
  });
}

export default connectDB;
