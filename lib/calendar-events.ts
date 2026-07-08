import type { CalendarEventWithWeather } from "@/lib/brief";
import { getDayWindow } from "@/lib/datetime";
import { geocodeLocation } from "@/lib/geocode";
import {
  fetchEventsFromCalendars,
  fetchTodayEvents,
  isVirtualLocation,
} from "@/lib/google-calendar";
import { getWeather } from "@/lib/weather";

export async function getCalendarEventsWithWeather(
  accessToken: string,
  timezone: string,
  dayOffset: number,
  calendarIds?: string[]
): Promise<CalendarEventWithWeather[]> {
  const { timeMin, timeMax } = getDayWindow(timezone, dayOffset);

  const events =
    calendarIds && calendarIds.length > 0
      ? await fetchEventsFromCalendars(
          accessToken,
          calendarIds,
          timeMin,
          timeMax
        )
      : await fetchTodayEvents(accessToken, timeMin, timeMax);

  return Promise.all(
    events.map(async (event) => {
      if (isVirtualLocation(event.location)) {
        return {
          ...event,
          lat: null,
          lon: null,
          displayName: null,
          weather: null,
        };
      }

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
