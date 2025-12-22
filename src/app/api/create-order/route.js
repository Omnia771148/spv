import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { grandTotal } = body;

    // 1. Create Razorpay Order Only (No DB Save yet)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(grandTotal) * 100), // Amount in paise
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    });

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
    });

  } catch (error) {
    console.error("RAZORPAY ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}