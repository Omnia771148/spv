import { NextResponse } from "next/server";
import connectionToDatabase from "lib/mongoose";
import RestaurantStatus from "../../../../../models/RestaurantStatus";

export async function GET() {
    await connectionToDatabase();

    const status = await RestaurantStatus.findOne({ restaurantId: "6" });


    return NextResponse.json({
        isActive: status?.isActive ?? false
    });
}
