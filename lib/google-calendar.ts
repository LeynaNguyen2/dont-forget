export interface CalendarEvent {
  title: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface GoogleCalendar {
  id: string;
  name: string;
  backgroundColor: string;
  primary?: boolean;
}

interface GoogleCalendarEvent {
  summary?: string;
  location?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
}

interface GoogleCalendarListResponse {
  items?: GoogleCalendarEvent[];
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

interface GoogleCalendarListEntry {
  id?: string;
  summary?: string;
  backgroundColor?: string;
  primary?: boolean;
}

interface GoogleCalendarListApiResponse {
  items?: GoogleCalendarListEntry[];
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

function getEventTime(
  value: GoogleCalendarEvent["start"] | GoogleCalendarEvent["end"]
): string | null {
  if (!value) {
    return null;
  }

  return value.dateTime ?? value.date ?? null;
}

const VIRTUAL_LOCATION_PATTERNS = [
  /zoom\.us/i,
  /meet\.google\.com/i,
  /teams\.microsoft\.com/i,
];

export function resolveEventLocation(location: string | undefined | null): string {
  const trimmed = location?.trim() ?? "";
  if (!trimmed) {
    return "Virtual";
  }

  if (VIRTUAL_LOCATION_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return "Virtual";
  }

  return trimmed;
}

export function isVirtualLocation(location: string): boolean {
  return location === "Virtual";
}

function mapEvent(event: GoogleCalendarEvent): CalendarEvent | null {
  const startTime = getEventTime(event.start);
  const endTime = getEventTime(event.end);

  if (!startTime || !endTime) {
    return null;
  }

  return {
    title: event.summary?.trim() || "Untitled event",
    startTime,
    endTime,
    location: resolveEventLocation(event.location),
  };
}

export async function fetchCalendarList(
  accessToken: string
): Promise<GoogleCalendar[]> {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 401) {
    throw new Error("TOKEN_EXPIRED");
  }

  if (!response.ok) {
    const body = (await response.json()) as GoogleCalendarListApiResponse;
    throw new Error(body.error?.message ?? "Failed to fetch calendar list");
  }

  const data = (await response.json()) as GoogleCalendarListApiResponse;

  return (data.items ?? [])
    .filter((item): item is GoogleCalendarListEntry & { id: string } =>
      Boolean(item.id)
    )
    .map((item) => ({
      id: item.id,
      name: item.summary?.trim() || "Untitled calendar",
      backgroundColor: item.backgroundColor ?? "#3B6FE8",
      primary: item.primary,
    }));
}

async function fetchCalendarEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
  });

  const encodedCalendarId = encodeURIComponent(calendarId);
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 401) {
    throw new Error("TOKEN_EXPIRED");
  }

  if (!response.ok) {
    const body = (await response.json()) as GoogleCalendarListResponse;
    throw new Error(
      body.error?.message ?? "Failed to fetch calendar events"
    );
  }

  const data = (await response.json()) as GoogleCalendarListResponse;

  return (data.items ?? [])
    .map(mapEvent)
    .filter((event): event is CalendarEvent => event !== null);
}

export async function fetchEventsFromCalendars(
  accessToken: string,
  calendarIds: string[],
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  if (calendarIds.length === 0) {
    return [];
  }

  const eventGroups = await Promise.all(
    calendarIds.map((calendarId) =>
      fetchCalendarEvents(accessToken, calendarId, timeMin, timeMax)
    )
  );

  const merged = eventGroups.flat();
  const seen = new Set<string>();

  return merged
    .filter((event) => {
      const key = `${event.title}|${event.startTime}|${event.location}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
}

export async function fetchTodayEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  return fetchCalendarEvents(accessToken, "primary", timeMin, timeMax);
}
