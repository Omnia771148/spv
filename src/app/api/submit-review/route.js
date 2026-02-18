import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectionToDatabase from "lib/mongoose";
import OrderReview from "../../../../models/OrderReview";

export async function POST(request) {
    try {
        await connectionToDatabase();

        const body = await request.json();
        const {
            orderId,
            userId,
            restaurantId,
            deliveryBoyId,
            restaurantRating,
            restaurantReview,
            deliveryBoyRating,
            deliveryBoyReview
        } = body;

        // specific validation can be added here
        if (!orderId || !userId || !restaurantId) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if review already exists for this order
        const existingReview = await OrderReview.findOne({ orderId });
        if (existingReview) {
            return NextResponse.json(
                { message: "Review already submitted for this order" },
                { status: 400 }
            );
        }

        const newReview = new OrderReview({
            orderId: String(orderId),
            userId: String(userId),
            restaurantId: String(restaurantId),
            deliveryBoyId: deliveryBoyId ? String(deliveryBoyId) : undefined,
            restaurantRating,
            restaurantReview,
            deliveryBoyRating,
            deliveryBoyReview
        });

        await newReview.save();
        console.log(`Review saved for order ${orderId}, Restaurant: ${restaurantId}`);

        return NextResponse.json(
            { message: "Review submitted successfully", review: newReview },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error submitting review:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
