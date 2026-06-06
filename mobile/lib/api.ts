import Constants from "expo-constants";
import type { CalendarEventWithWeather, Session, Tab } from "./types";

const SESSION_COOKIE_KEY = "next-auth.session-token";
const SECURE_SESSION_COOKIE_KEY = "__Secure-next-auth.session-token";

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3000`;
  }

  return "http://localhost:3000";
}

let sessionCookie: string | null =
  process.env.EXPO_PUBLIC_SESSION_COOKIE ?? null;

export function setSessionCookie(cookie: string | null): void {
  sessionCookie = cookie;
}

export function getSessionCookie(): string | null {
  return sessionCookie;
}

function buildAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {};

  if (sessionCookie) {
    headers.Cookie = sessionCookie;
  }

  return headers;
}

export async function parseApiError(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return data.error ?? fallback;
    }

    const text = await response.text();
    return text || fallback;
  } catch {
    return fallback;
  }
}

export async function fetchSession(): Promise<Session | null> {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/session`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (!data?.user) {
    return null;
  }

  return data as Session;
}

export async function fetchCalendarEvents(
  timezone: string,
  day: Tab
): Promise<{ events: CalendarEventWithWeather[]; error?: string }> {
  const params = new URLSearchParams({ timezone, day });
  const response = await fetch(
    `${getApiBaseUrl()}/api/calendar?${params.toString()}`,
    {
      headers: {
        ...buildAuthHeaders(),
        "x-timezone": timezone,
      },
    }
  );

  if (!response.ok) {
    return {
      events: [],
      error: await parseApiError(
        response,
        `Failed to load calendar events (${response.status}).`
      ),
    };
  }

  const data = await response.json();
  return { events: data.events ?? [] };
}

export async function fetchBrief(
  timezone: string
): Promise<{ brief: string | null; error?: string }> {
  const params = new URLSearchParams({ timezone });
  const response = await fetch(
    `${getApiBaseUrl()}/api/brief?${params.toString()}`,
    {
      headers: {
        ...buildAuthHeaders(),
        "x-timezone": timezone,
      },
    }
  );

  if (!response.ok) {
    return {
      brief: null,
      error: await parseApiError(
        response,
        `Failed to load morning brief (${response.status}).`
      ),
    };
  }

  return { brief: await response.text() };
}

export async function fetchWeather(
  location: string,
  day: Tab
): Promise<{
  weather: import("./types").WeatherData | null;
  displayName: string | null;
  error?: string;
}> {
  const params = new URLSearchParams({ location, day });
  const response = await fetch(
    `${getApiBaseUrl()}/api/weather?${params.toString()}`
  );

  if (!response.ok) {
    return {
      weather: null,
      displayName: null,
      error: await parseApiError(
        response,
        "Failed to load home location weather."
      ),
    };
  }

  const data = await response.json();
  return {
    weather: data.weather ?? null,
    displayName: data.displayName ?? location,
  };
}

export function getSignInUrl(): string {
  const callbackUrl = encodeURIComponent("dontforget://auth");
  return `${getApiBaseUrl()}/api/auth/signin/google?callbackUrl=${callbackUrl}`;
}

export { SESSION_COOKIE_KEY, SECURE_SESSION_COOKIE_KEY };
