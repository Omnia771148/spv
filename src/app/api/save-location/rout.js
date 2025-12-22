import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";


export async function POST(req) {
  try {
    await connectionToDatabase();
    
    const body = await req.json();
    const { url } = body;

    console.log("Received URL:", url);

    // Using the Location model to save to MongoDB
    await Location.create({
      url,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Location Save Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}