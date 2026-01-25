import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/mongoose";
import RestaurantStatus from "../../../../../models/RestaurantStatus";

export async function GET() {
    await connectionToDatabase();

    const statuses = await RestaurantStatus.find({});

    // Create a map of restaurantId -> isActive
    const statusMap = {};
    statuses.forEach(status => {
        statusMap[status.restaurantId] = status.isActive;
    });

    return NextResponse.json(statusMap);
}
