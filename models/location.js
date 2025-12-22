import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  latitude: Number,      // ✅ Required for your second code
  longitude: Number,     // ✅ Required for your second code
  mapUrl: String,        // ✅ Required for your second code
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
}, { strict: false }); // 👈 Adding this allows any data to pass through even if not defined

// Use the logical OR to prevent "OverwriteModelError"
export default mongoose.models.Location || mongoose.model("Location", LocationSchema);