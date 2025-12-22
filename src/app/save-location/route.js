import connectToDatabase from "../../../../lib/mongoose";

export async function POST(req) {
  try {
    const { url } = await req.json();
    
    // 1. Establish connection
    const dbConnection = await connectToDatabase();
    
    // 2. Access the database and target the 'locations' collection directly
    // This bypasses the Order schema entirely
    const collection = dbConnection.connection.db.collection("locations");

    const result = await collection.insertOne({ 
      url, 
      createdAt: new Date() 
    });

    return new Response(JSON.stringify({ 
      success: true, 
      id: result.insertedId 
    }), { status: 200 });

  } catch (err) {
    console.error("Database error:", err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message 
    }), { status: 500 });
  }
}