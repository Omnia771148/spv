"use server";

export async function getExactDistance(userCoords, restCoords) {
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  try {
    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'routes.distanceMeters' // Only ask for the road meters
      },
      body: JSON.stringify({
        origin: { 
          location: { latLng: { latitude: restCoords.lat, longitude: restCoords.lng } } 
        },
        destination: { 
          location: { latLng: { latitude: userCoords.lat, longitude: userCoords.lng } } 
        },
        travelMode: "DRIVE", 
        routingPreference: "ROUTING_PREFERENCE_UNSPECIFIED", // This matches standard Maps directions
        computeAlternativeRoutes: false,
      })
    });

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    const roadDistanceKm = route.distanceMeters / 1000; // Exact road meters to KM
    
    return {
      km: roadDistanceKm.toFixed(1),
      fee: Math.ceil(25 + (roadDistanceKm * 10))
    };
  } catch (error) {
    return null;
  }
}