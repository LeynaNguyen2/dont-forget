import { NextResponse } from "next/server";
import { generateBrief } from "@/lib/anthropic";
import {
  BRIEF_SYSTEM_PROMPT,
  type CalendarEventWithWeather,
  formatEventsForPrompt,
} from "@/lib/brief";
import { getTimezoneFromRequest } from "@/lib/datetime";

interface CalendarApiResponse {
  events?: CalendarEventWithWeather[];
  error?: string;
}

async function fetchCalendarEvents(
  request: Request
): Promise<{ status: number; data: CalendarApiResponse }> {
  const timezone = getTimezoneFromRequest(request);
  if (!timezone) {
    return {
      status: 400,
      data: {
        error:
          "Missing timezone. Pass ?timezone=America/Los_Angeles or an x-timezone header.",
      },
    };
  }

  const origin = new URL(request.url).origin;
  const calendarUrl = new URL("/api/calendar", origin);
  calendarUrl.searchParams.set("timezone", timezone);

  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) {
    headers.set("cookie", cookie);
  }

  const timezoneHeader = request.headers.get("x-timezone");
  if (timezoneHeader) {
    headers.set("x-timezone", timezoneHeader);
  }

  const response = await fetch(calendarUrl, { headers });
  const data = (await response.json()) as CalendarApiResponse;

  if (!response.ok) {
    return {
      status: response.status,
      data: {
        error: data.error ?? "Failed to fetch calendar events.",
      },
    };
  }

  return { status: response.status, data };
}

export async function GET(request: Request) {
  try {
    const { status, data: calendarData } = await fetchCalendarEvents(request);

    if (!calendarData.events) {
      return NextResponse.json(
        { error: calendarData.error ?? "Failed to fetch calendar events." },
        { status }
      );
    }

    const events = calendarData.events;
    const userPrompt = formatEventsForPrompt(events);
    const brief = await generateBrief(BRIEF_SYSTEM_PROMPT, userPrompt);

    return new Response(brief, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Brief API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate morning brief.",
      },
      { status: 500 }
    );
  }
}
