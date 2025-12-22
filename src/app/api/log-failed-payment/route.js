import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import PaymentFailedOrder from "../../../../models/PaymentFailedOrder";
// ✅ 1. Import your generator
import { generateOrderId } from "../../../../lib/generateOrderId"; 

export async function POST(request) {
  try {
    await connectionToDatabase();
    
    const { 
      error_code, 
      error_description, 
      razorpay_payment_id, 
      razorpay_order_id,
      orderData 
    } = await request.json();

    // ✅ 2. Generate the Custom ID (e.g., ORD-001005)
    // Note: This will increment your sequence number even for failed orders.
    const customOrderId = await generateOrderId();

    const failedOrder = await PaymentFailedOrder.create({
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
      
      // ✅ 3. Save Custom ID here
      orderId: customOrderId, 
      
      // ✅ 4. Save Razorpay ID separately
      razorpayOrderId: razorpay_order_id, 
      
      // Failure details
      paymentId: razorpay_payment_id,
      failureCode: error_code,
      failureReason: error_description,
    });

    return NextResponse.json({ success: true, id: failedOrder._id, orderId: customOrderId });

  } catch (error) {
    console.error("LOG FAILED ORDER ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}