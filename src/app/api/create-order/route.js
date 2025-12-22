// src/app/api/create-order/route.js
export async function POST(req) {
  try {
    await connectionToDatabase();
    const body = await req.json();

    const {
      userId, items, restaurantId, totalCount,
      totalPrice, gst, deliveryCharge, grandTotal, aa,
      location // ✅ Catch the location from the body
    } = body;

    const customOrderId = `ORD-${Date.now().toString().slice(-8)}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(grandTotal) * 100),
      currency: "INR",
      receipt: customOrderId,
    });

    // Save to MongoDB including the location object
    const newOrder = await Order.create({
      userId,
      items,
      totalCount,
      totalPrice,
      gst,
      deliveryCharge,
      grandTotal,
      restaurantId,
      orderId: customOrderId,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "Pending",
      aa,
      location, // ✅ This will now save mapUrl to the Order document
    });

    return NextResponse.json({
      success: true,
      dbOrderId: newOrder._id,
      razorpayOrderId: razorpayOrder.id,
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}