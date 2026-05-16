import mongoose from "mongoose";

const couponCodeSchema = new mongoose.Schema({
  couponCode: { type: String, required: true, unique: true },
});

// Force re-registering the model with the updated schema in development
const CouponCode = mongoose.models.CouponCode || mongoose.model("CouponCode", couponCodeSchema);
if (mongoose.models.CouponCode && couponCodeSchema) {
  CouponCode.schema = couponCodeSchema;
}
export default CouponCode;
