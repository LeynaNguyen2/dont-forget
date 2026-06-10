import { NextResponse } from "next/server";

interface OpenWeatherGeocodeResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ cities: [] });
  }

  const apiKey = process.env.OPENWEATHER_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "City search is not configured." },
      { status: 500 }
    );
  }

  try {
    const params = new URLSearchParams({
      q: `${query},US`,
      limit: "8",
      appid: apiKey,
    });

    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?${params}`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to search cities." },
        { status: 500 }
      );
    }

    const data = (await response.json()) as OpenWeatherGeocodeResult[];
    const cities = (Array.isArray(data) ? data : [])
      .filter((item) => item.country === "US")
      .map((item) => ({
        name: item.name,
        state: item.state ?? "",
        label: [item.name, item.state].filter(Boolean).join(", "),
        lat: item.lat,
        lon: item.lon,
      }));

    const unique = new Map<string, (typeof cities)[number]>();
    for (const city of cities) {
      unique.set(city.label, city);
    }

    return NextResponse.json({ cities: Array.from(unique.values()) });
  } catch (error) {
    console.error("City search error:", error);
    return NextResponse.json(
      { error: "Failed to search cities." },
      { status: 500 }
    );
  }
}
