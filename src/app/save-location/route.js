import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";


export async function POST(req) {
  try {
    await connectionToDatabase();
    const body = await req.json();
    const { lat, lng, locationUrl } = body;

    await Location.create({
      latitude: lat,
      longitude: lng,
      mapUrl: locationUrl, // Saving the generated link
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}