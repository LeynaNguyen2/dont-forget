import type { CalendarEventKind } from "@/lib/google-calendar";
import type { WeatherData } from "@/lib/weather";

export interface CalendarEventWithWeather {
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  kind: CalendarEventKind;
  lat: number | null;
  lon: number | null;
  displayName: string | null;
  weather: WeatherData | null;
}

export const BRIEF_SYSTEM_PROMPT = `You are a smart morning assistant. Given a list of today's calendar events, write a concise morning brief in 3-4 sentences total. Be punchy, warm, and practical.

For each event type:
- In-person events with a location and weather data: give weather-based advice (what to wear, what to bring, when to leave, etc.). Mention significant weather differences between locations if relevant.
- Virtual meetings (Zoom/Meet/Teams): acknowledge the meeting and give a quick productivity tip.
- Events with no location (e.g. Exam, Presentation, Study, Interview): give a short motivational nudge tied to the event title and time (e.g. "You've got your exam at 2pm — you've got this!" or "Big presentation today — take a deep breath, you're prepared").

Weave all of today's events into one cohesive brief. Do not mention UV index or sunscreen. No filler phrases like "Good morning!" or "Have a great day!"`;

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

function formatEventType(event: CalendarEventWithWeather): string {
  switch (event.kind) {
    case "physical":
      return "in-person (has location)";
    case "virtual_meeting":
      return "virtual meeting (Zoom/Meet/Teams)";
    case "no_location":
      return "no location specified";
  }
}

export function formatEventsForPrompt(
  events: CalendarEventWithWeather[]
): string {
  if (!events.length) {
    return "No calendar events scheduled for today.";
  }

  return events
    .map((event, index) => {
      const lines = [
        `Event ${index + 1}:`,
        `- Title: ${event.title}`,
        `- Start: ${event.startTime}`,
        `- End: ${event.endTime}`,
        `- Type: ${formatEventType(event)}`,
      ];

      if (event.kind === "physical") {
        const locationLabel = event.displayName
          ? `${event.location} (${event.displayName})`
          : event.location;
        lines.push(`- Location: ${locationLabel}`);
        lines.push(`- ${formatWeather(event.weather)}`);
      } else if (event.kind === "virtual_meeting") {
        lines.push("- Location: Virtual meeting");
      } else {
        lines.push("- Location: None specified");
      }

      return lines.join("\n");
    })
    .join("\n\n");
}
