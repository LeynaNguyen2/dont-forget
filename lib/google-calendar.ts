export interface CalendarEvent {
  title: string;
  startTime: string;
  endTime: string;
  location: string;
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

function getEventTime(
  value: GoogleCalendarEvent["start"] | GoogleCalendarEvent["end"]
): string | null {
  if (!value) {
    return null;
  }

  return value.dateTime ?? value.date ?? null;
}

function mapEvent(event: GoogleCalendarEvent): CalendarEvent | null {
  const location = event.location?.trim();
  if (!location) {
    return null;
  }

  const startTime = getEventTime(event.start);
  const endTime = getEventTime(event.end);

  if (!startTime || !endTime) {
    return null;
  }

  return {
    title: event.summary?.trim() || "Untitled event",
    startTime,
    endTime,
    location,
  };
}

export async function fetchTodayEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
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
