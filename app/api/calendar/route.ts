import { NextResponse } from "next/server";
import { getDayFromRequest, getDayWindow, getTimezoneFromRequest } from "@/lib/datetime";
import { geocodeLocation } from "@/lib/geocode";
import { fetchTodayEvents } from "@/lib/google-calendar";
import { getSession } from "@/lib/session";
import { getWeather } from "@/lib/weather";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession(request);

    if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
      return NextResponse.json(
        {
          error:
            session?.error === "RefreshAccessTokenError"
              ? "Session expired. Please sign in again."
              : "Unauthorized. Please sign in.",
        },
        { status: 401 }
      );
    }

    const timezone = getTimezoneFromRequest(request);
    if (!timezone) {
      return NextResponse.json(
        {
          error:
            "Missing timezone. Pass ?timezone=America/Los_Angeles or an x-timezone header.",
        },
        { status: 400 }
      );
    }

    const dayOffset = getDayFromRequest(request);

    let timeMin: string;
    let timeMax: string;

    try {
      ({ timeMin, timeMax } = getDayWindow(timezone, dayOffset));
    } catch {
      return NextResponse.json(
        { error: "Invalid timezone." },
        { status: 400 }
      );
    }

    const events = await fetchTodayEvents(
      session.accessToken,
      timeMin,
      timeMax
    );

    const eventsWithCoordinates = await Promise.all(
      events.map(async (event) => {
        const geocoded = await geocodeLocation(event.location);
        const lat = geocoded?.lat ?? null;
        const lon = geocoded?.lon ?? null;

        const weather =
          lat !== null && lon !== null
            ? await getWeather(lat, lon, dayOffset)
            : null;

        return {
          ...event,
          lat,
          lon,
          displayName: geocoded?.displayName ?? null,
          weather,
        };
      })
    );

    return NextResponse.json({ events: eventsWithCoordinates });
  } catch (error) {
    if (error instanceof Error && error.message === "TOKEN_EXPIRED") {
      return NextResponse.json(
        { error: "Access token expired. Please sign in again." },
        { status: 401 }
      );
    }

    console.error("Calendar API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch calendar events." },
      { status: 500 }
    );
  }
}
