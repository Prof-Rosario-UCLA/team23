import mongoose from "mongoose";

const FlashcardSchema = new mongoose.Schema({
  lectureId: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture", required: true },
  front: { type: String, required: true },
  back: { type: String, required: true },
  isKnown: { type: Boolean, default: false },
  isReview: { type: Boolean, default: false },
});

export default mongoose.model("Flashcard", FlashcardSchema);
