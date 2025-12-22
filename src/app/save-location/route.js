import connectToDatabase from "../../../lib/mongodb"; // relative path to lib/mongodb.js

export async function POST(req) {
  try {
    const { url } = await req.json();
    console.log("Received URL:", url); // debug

    const db = await connectToDatabase();
    const collection = db.connection.db.collection("locations"); // collection name

    const result = await collection.insertOne({ url, createdAt: new Date() });
    console.log("Inserted ID:", result.insertedId);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("MongoDB error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
