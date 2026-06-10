import { NextResponse } from "next/server";
import { getCalendarEventsWithWeather } from "@/lib/calendar-events";
import { getDayFromRequest, getDayWindow, getTimezoneFromRequest } from "@/lib/datetime";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession();

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

    try {
      getDayWindow(timezone, dayOffset);
    } catch {
      return NextResponse.json({ error: "Invalid timezone." }, { status: 400 });
    }

    const eventsWithCoordinates = await getCalendarEventsWithWeather(
      session.accessToken,
      timezone,
      dayOffset
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
