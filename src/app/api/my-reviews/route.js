import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectionToDatabase from "lib/mongoose";
import OrderReview from "../../../../models/OrderReview";

export async function GET(request) {
    try {
        await connectionToDatabase();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ message: "UserId required" }, { status: 400 });
        }

        const reviews = await OrderReview.find({ userId }).sort({ createdAt: -1 });
        return NextResponse.json(reviews);

    } catch (error) {
        console.error("Error fetching user reviews:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
