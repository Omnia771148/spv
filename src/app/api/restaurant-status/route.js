import { NextResponse } from "next/server";
import connectionToDatabase from "lib/mongoose";
import RestaurantStatus from "../../../../models/RestaurantStatus";

export async function GET(request) {
    await connectionToDatabase();
    
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
        return NextResponse.json({ error: "restaurantId is required" }, { status: 400 });
    }

    try {
        const status = await RestaurantStatus.findOne({ restaurantId });
        return NextResponse.json({
            isActive: status?.isActive ?? false
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
