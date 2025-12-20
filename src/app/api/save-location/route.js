import connectToDatabase from "../../../../lib/mongoose";
import Location from "../../../../models/location";

export async function POST(req) {
  try {
    await connectToDatabase(); // just connect

    const { url } = await req.json();
    console.log("Received URL:", url);

    // ✅ USE MONGOOSE MODEL
    await Location.create({
      url,
      createdAt: new Date(),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (err) {
    console.error("MongoDB error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
