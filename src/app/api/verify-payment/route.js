import { NextResponse } from "next/server";
import crypto from "crypto";
import connectionToDatabase from "../../../../lib/mongoose";
import Order from "../../../../models/Order";

export async function POST(request) {
  try {
    await connectionToDatabase();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = await request.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await Order.findByIdAndUpdate(dbOrderId, { 
        paymentStatus: "Paid",
        razorpayPaymentId: razorpay_payment_id 
      });
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: "Invalid Signature" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}