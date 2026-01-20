"use server";

export async function getExactDistance(userCoords, restCoords) {
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  if (!API_KEY) {
    console.error("❌ Google Maps API Key is missing!");
    return null;
  }

  try {
    const requestBody = {
      origin: {
        location: { latLng: { latitude: restCoords.lat, longitude: restCoords.lng } }
      },
      destination: {
        location: { latLng: { latitude: userCoords.lat, longitude: userCoords.lng } }
      },
      travelMode: "DRIVE",
      routingPreference: "ROUTING_PREFERENCE_UNSPECIFIED",
      computeAlternativeRoutes: false,
    };

    // console.log("📤 Sending Route Request:", JSON.stringify(requestBody));

    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'routes.distanceMeters'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Google API Request Failed:", data);
      return null;
    }

    if (!data.routes || data.routes.length === 0) {
      console.warn("⚠️ No routes found in response:", data);
      return null;
    }

    const route = data.routes[0];
    const roadDistanceKm = route.distanceMeters / 1000;

    return {
      km: roadDistanceKm.toFixed(1),
      fee: Math.ceil(25 + (roadDistanceKm * 10))
    };
  } catch (error) {
    console.error("❌ internal Server Error in getExactDistance:", error);
    return null;
  }
}