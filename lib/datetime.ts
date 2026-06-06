function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

function formatInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(" ", "T");
}

function toUtcInstant(
  dateStr: string,
  time: string,
  timeZone: string
): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute, second] = time.split(":").map(Number);
  const target = `${dateStr}T${time.padEnd(8, "0")}`;

  let timestamp = Date.UTC(year, month - 1, day, hour, minute, second);

  for (let attempt = 0; attempt < 6; attempt++) {
    const formatted = formatInTimeZone(new Date(timestamp), timeZone);

    if (formatted === target) {
      return new Date(timestamp);
    }

    const targetMs = Date.parse(`${target}Z`);
    const formattedMs = Date.parse(`${formatted}Z`);
    timestamp += targetMs - formattedMs;
  }

  return new Date(timestamp);
}

function addCalendarDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function getTimezoneFromRequest(request: Request): string | null {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("timezone");
  if (fromQuery) {
    return fromQuery;
  }

  return request.headers.get("x-timezone");
}

export function getDayWindow(
  timeZone: string,
  dayOffset = 0
): {
  timeMin: string;
  timeMax: string;
} {
  if (!isValidTimeZone(timeZone)) {
    throw new Error("Invalid timezone");
  }

  const today = new Date().toLocaleDateString("en-CA", { timeZone });
  const startDay = addCalendarDays(today, dayOffset);
  const endDay = addCalendarDays(today, dayOffset + 1);

  const timeMin = toUtcInstant(startDay, "00:00:00", timeZone).toISOString();
  const timeMax = toUtcInstant(endDay, "00:00:00", timeZone).toISOString();

  return { timeMin, timeMax };
}

export function getTodayWindow(timeZone: string): {
  timeMin: string;
  timeMax: string;
} {
  return getDayWindow(timeZone, 0);
}

export function getDayFromRequest(request: Request): number {
  const url = new URL(request.url);
  const day = url.searchParams.get("day");
  return day === "tomorrow" ? 1 : 0;
}
