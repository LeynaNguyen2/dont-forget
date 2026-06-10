import type { CalendarEventWithWeather } from "@/lib/brief";
import { getDayWindow } from "@/lib/datetime";
import { geocodeLocation } from "@/lib/geocode";
import { fetchTodayEvents } from "@/lib/google-calendar";
import { getWeather } from "@/lib/weather";

export async function getCalendarEventsWithWeather(
  accessToken: string,
  timezone: string,
  dayOffset: number
): Promise<CalendarEventWithWeather[]> {
  const { timeMin, timeMax } = getDayWindow(timezone, dayOffset);

  const events = await fetchTodayEvents(accessToken, timeMin, timeMax);

  return Promise.all(
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
}
