import type { WeatherData } from "@/lib/weather";

export interface CalendarEventWithWeather {
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  lat: number | null;
  lon: number | null;
  displayName: string | null;
  weather: WeatherData | null;
}

export const BRIEF_SYSTEM_PROMPT = `You are a smart morning assistant. Given a list of today's calendar events with weather data for each location, write a concise morning brief in 3-5 sentences. Focus on: what to bring based on rain, wind, and temperature (such as an umbrella or jacket), any significant weather differences between locations, and one leave-by time for the most time-sensitive event. Do not mention UV index or sunscreen. Be direct and practical. No filler phrases like 'Good morning!' or 'Have a great day!'`;

function formatWeather(weather: WeatherData | null): string {
  if (!weather) {
    return "Weather: unavailable";
  }

  return [
    `Weather: ${weather.temperatureF}°F`,
    weather.condition,
    `${weather.chanceOfRain}% chance of rain`,
    `wind ${weather.windSpeed} mph`,
  ].join(", ");
}

export function formatEventsForPrompt(
  events: CalendarEventWithWeather[]
): string {
  if (!events.length) {
    return "No calendar events with locations scheduled for today.";
  }

  return events
    .map((event, index) => {
      const locationLabel = event.displayName
        ? `${event.location} (${event.displayName})`
        : event.location;

      return [
        `Event ${index + 1}:`,
        `- Title: ${event.title}`,
        `- Start: ${event.startTime}`,
        `- End: ${event.endTime}`,
        `- Location: ${locationLabel}`,
        `- ${formatWeather(event.weather)}`,
      ].join("\n");
    })
    .join("\n\n");
}
