import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  id: { type: String, required: true },
  seq: { type: Number, default: 1000 } // ✅ Starts at 1000
});

export default mongoose.models.Counter || mongoose.model("Counter", counterSchema);