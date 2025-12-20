import mongoose from "mongoose";
import connectionToDatabase from "./mongoose.js";

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

export async function generateOrderId() {
  await connectionToDatabase();

  const today = new Date().toISOString().split("T")[0]; 
  const counterKey = `orderId-${today}`;

  
  const counter = await Counter.findByIdAndUpdate(
    counterKey,
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  const seq = (counter.seq+1000).toString().padStart(6, "0"); 

  
  return `ORD-${seq}`;
}
