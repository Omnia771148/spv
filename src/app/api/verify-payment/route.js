import { NextResponse } from "next/server";
import crypto from "crypto";
import connectionToDatabase from "../../../../lib/mongoose";
import Order from "../../../../models/Order";
import { generateOrderId } from "../../../../lib/generateOrderId"; // Import this here now

export async function POST(request) {
  try {
    await connectionToDatabase();
    
    // We now receive orderData along with payment details
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      orderData // <--- Contains items, location, userId, etc.
    } = await request.json();

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, message: "Invalid Signature" }, { status: 400 });
    }

    // 2. Signature is Valid -> NOW Generate Custom ID and Save to DB
    const formattedOrderId = await generateOrderId();

    const newOrder = await Order.create({
      userId: orderData.userId,
      items: orderData.items,
      restaurantId: orderData.restaurantId,
      totalCount: orderData.totalCount,
      totalPrice: orderData.totalPrice,
      gst: orderData.gst,
      deliveryCharge: orderData.deliveryCharge,
      grandTotal: orderData.grandTotal,
      aa: orderData.aa,
      location: orderData.location,
      
      // Payment Details
      orderId: formattedOrderId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: "Paid", // Directly set to Paid
    });

    return NextResponse.json({ success: true, orderId: newOrder._id });

  } catch (error) {
    console.error("VERIFY & SAVE ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}