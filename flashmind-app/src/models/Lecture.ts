import mongoose from "mongoose";

const LectureSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  name: { type: String, required: true },
  notes: { type: String },
});

export default mongoose.model("Lecture", LectureSchema);
