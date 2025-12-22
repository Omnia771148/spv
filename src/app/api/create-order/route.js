export async function POST(req) {
  try {
    await connectionToDatabase();
    const body = await req.json();
    const { userId, items, restaurantId, grandTotal, location, aa, totalPrice, gst, deliveryCharge, totalCount } = body;

    // 1. Get/Create the Sequence Number
    let counter = await Counter.findOneAndUpdate(
      { id: "orderId" },
      { $inc: { seq: 1 } }, 
      { new: true, upsert: true }
    );

    // ✅ FIX: If the counter just started at 1 (new collection), reset it to 1001
    if (counter.seq === 1) {
      counter = await Counter.findOneAndUpdate(
        { id: "orderId" },
        { $set: { seq: 1001 } }, 
        { new: true }
      );
    }

    // 2. Format the custom ID as ORD-1001
    const formattedOrderId = `ORD-${counter.seq}`; 

    // 3. Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(grandTotal) * 100),
      currency: "INR",
      receipt: formattedOrderId, // Now "ORD-1001"
    });

    // 4. Save to MongoDB
    const newOrder = await Order.create({
      userId, 
      items, 
      restaurantId, 
      totalCount, 
      totalPrice, 
      gst, 
      deliveryCharge, 
      grandTotal, 
      aa,
      orderId: formattedOrderId, // Now "ORD-1001"
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "Pending",
      location, 
    });

    return NextResponse.json({ 
      success: true, 
      razorpayOrderId: razorpayOrder.id, 
      dbOrderId: newOrder._id,
      displayOrderId: formattedOrderId 
    });

  } catch (error) {
    console.error("CRITICAL BACKEND ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}