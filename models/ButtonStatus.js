import mongoose from "mongoose";

const ButtonStatusSchema = new mongoose.Schema({
    buttonId: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
});

const ButtonStatus = mongoose.models.ButtonStatus || mongoose.model("ButtonStatus", ButtonStatusSchema);
export default ButtonStatus;
