import { NextResponse } from "next/server";
import { geocodeLocation } from "@/lib/geocode";
import { getWeather } from "@/lib/weather";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const location = url.searchParams.get("location");
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
  const day = url.searchParams.get("day");
  let dayOffset = 0;
  if (day === "tomorrow") {
    dayOffset = 1;
  } else if (day && day !== "today") {
    const parsed = Number(day);
    if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 6) {
      dayOffset = parsed;
    }
  }

  let resolvedLat = lat;
  let resolvedLon = lon;
  let displayName: string | null = null;

  if (location) {
    const geocoded = await geocodeLocation(location);
    if (!geocoded) {
      return NextResponse.json(
        { error: "Could not geocode location." },
        { status: 400 }
      );
    }

    resolvedLat = geocoded.lat;
    resolvedLon = geocoded.lon;
    displayName = geocoded.displayName;
  } else if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json(
      { error: "Provide lat/lon or a location parameter." },
      { status: 400 }
    );
  }

  const weather = await getWeather(resolvedLat, resolvedLon, dayOffset);

  if (!weather) {
    return NextResponse.json(
      { error: "Failed to fetch weather." },
      { status: 500 }
    );
  }

  return NextResponse.json({ weather, displayName });
}
