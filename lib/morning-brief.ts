import { generateBrief, generateBriefPair } from "@/lib/anthropic";
import {
  BRIEF_SYSTEM_PROMPT,
  type CalendarEventWithWeather,
  formatEventsForPrompt,
} from "@/lib/brief";
import { getCalendarEventsWithWeather } from "@/lib/calendar-events";

export interface MorningBriefPair {
  summary: string;
  fullBrief: string;
  date: string;
}

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

function getTodayDateKey(timezone: string): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: timezone });
}

export async function generateMorningBriefPair(options: {
  accessToken: string;
  timezone: string;
  dayOffset?: number;
}): Promise<MorningBriefPair> {
  const events = await getCalendarEventsWithWeather(
    options.accessToken,
    options.timezone,
    options.dayOffset ?? 0
  );
  const userPrompt = formatEventsForPrompt(events);
  const brief = await generateBriefPair(BRIEF_SYSTEM_PROMPT, userPrompt);

  return {
    ...brief,
    date: getTodayDateKey(options.timezone),
  };
}

export async function generateMorningBriefPairFromSessionCookie(options: {
  origin: string;
  sessionCookie: string;
  timezone: string;
}): Promise<MorningBriefPair> {
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
  const brief = await generateBriefPair(BRIEF_SYSTEM_PROMPT, userPrompt);

  return {
    ...brief,
    date: getTodayDateKey(options.timezone),
  };
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
