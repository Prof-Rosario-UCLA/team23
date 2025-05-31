import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

export default mongoose.model("Chat", ChatSchema);
