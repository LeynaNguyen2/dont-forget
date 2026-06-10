import { generateBrief } from "@/lib/anthropic";
import {
  BRIEF_SYSTEM_PROMPT,
  type CalendarEventWithWeather,
  formatEventsForPrompt,
} from "@/lib/brief";
import { getCalendarEventsWithWeather } from "@/lib/calendar-events";

interface CalendarApiResponse {
  events?: CalendarEventWithWeather[];
  error?: string;
}

export async function generateMorningBrief(options: {
  accessToken: string;
  timezone: string;
  dayOffset?: number;
}): Promise<string> {
  const events = await getCalendarEventsWithWeather(
    options.accessToken,
    options.timezone,
    options.dayOffset ?? 0
  );
  const userPrompt = formatEventsForPrompt(events);
  return generateBrief(BRIEF_SYSTEM_PROMPT, userPrompt);
}

export async function generateMorningBriefFromSessionCookie(options: {
  origin: string;
  sessionCookie: string;
  timezone: string;
}): Promise<string> {
  const calendarUrl = new URL("/api/calendar", options.origin);
  calendarUrl.searchParams.set("timezone", options.timezone);

  const response = await fetch(calendarUrl, {
    headers: {
      cookie: options.sessionCookie,
      "x-timezone": options.timezone,
    },
  });

  const data = (await response.json()) as CalendarApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to fetch calendar events.");
  }

  const events = data.events ?? [];
  const userPrompt = formatEventsForPrompt(events);
  return generateBrief(BRIEF_SYSTEM_PROMPT, userPrompt);
}
