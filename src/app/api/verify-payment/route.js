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

    console.log("🔥 VERIFY PAYMENT ORDER DATA:", orderData);

    // 1️⃣ VERIFY SIGNATURE
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // 2️⃣ GENERATE CUSTOM ORDER ID
    const formattedOrderId = await generateOrderId();

    // 3️⃣ SAVE ORDER
    const orderDoc = {
      userId: orderData.userId,
      items: orderData.items,

      totalCount: orderData.totalCount,
      totalPrice: orderData.totalPrice,
      gst: orderData.gst,
      deliveryCharge: orderData.deliveryCharge,
      grandTotal: orderData.grandTotal,

      restaurantId: orderData.restaurantId,
      aa: orderData.aa,

      // ✅ USER INFO
      userName: orderData.userName,
      userEmail: orderData.userEmail,
      userPhone: orderData.userPhone,

      flatNo: orderData.flatNo,
      street: orderData.street,
      landmark: orderData.landmark,
      deliveryAddress: orderData.deliveryAddress,

      location: orderData.location,

      orderId: formattedOrderId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: "Paid"
    };

    const newOrder = await Order.create(orderDoc);

    // 4️⃣ ORDER STATUS
    await OrderStatus.create({
      ...orderDoc,
      status: "Pending",
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      orderId: newOrder._id,
      formattedOrderId
    });

  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
