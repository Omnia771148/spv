import { NextResponse } from "next/server";
import crypto from "crypto";
import connectionToDatabase from "../../../../lib/mongoose";
import Order from "../../../../models/Order";
import OrderStatus from "../../../../models/OrderStatus";
import { generateOrderId } from "../../../../lib/generateOrderId";

export async function POST(request) {
  try {
    await connectionToDatabase();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = await request.json();

    console.log("🔥 VERIFY PAYMENT RECEIVED ORDER DATA:", orderData); // DEBUG LOG

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({
        success: false,
        message: "Invalid Signature"
      }, { status: 400 });
    }

    // 2. Generate Custom ID
    const formattedOrderId = await generateOrderId();

    // 3. Save to existing Order collection
    const orderDoc = {
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
      flatNo: orderData.flatNo || "",
      street: orderData.street || "",
      landmark: orderData.landmark || "",
      deliveryAddress: orderData.deliveryAddress || "", // Add this

      userName: orderData.userName || "",
      userEmail: orderData.userEmail || "",
      userPhone: orderData.userPhone || "",

      orderId: formattedOrderId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: "Paid",
    };

    const newOrder = await Order.create(orderDoc);

    // 4. Save to OrderStatus collection with same data + status field
    const orderStatusDoc = {
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
      flatNo: orderData.flatNo || "",
      street: orderData.street || "",
      landmark: orderData.landmark || "",
      deliveryAddress: orderData.deliveryAddress || "", // Add this

      userName: orderData.userName || "",
      userEmail: orderData.userEmail || "",
      userPhone: orderData.userPhone || "",

      orderId: formattedOrderId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: "Paid",
      status: "Pending", // Add status field here
      createdAt: new Date()
    };

    await OrderStatus.create(orderStatusDoc);

    return NextResponse.json({
      success: true,
      orderId: newOrder._id,
      formattedOrderId: formattedOrderId
    });

  } catch (error) {
    console.error("VERIFY & SAVE ERROR:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}