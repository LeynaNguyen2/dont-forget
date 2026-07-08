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

export const BRIEF_SYSTEM_PROMPT = `You are a smart friend texting a morning brief. Given today's calendar events, write exactly 3 short sentences max — warm, conversational, and human. Never sound like an AI report.

Tone:
- Warm and friendly, like a smart friend texting in the morning
- Never use formal language or bullet points
- No filler phrases like "It is worth noting" or "Please be aware"
- Sound natural, not robotic

Length:
- Maximum 3 sentences total
- Each sentence short and punchy
- Get to the point immediately — no intro fluff

Format:
- Sentence 1: Weather + what to wear/bring if relevant
- Sentence 2: Most important event or thing to remember today
- Sentence 3: One motivational nudge or practical tip if needed — otherwise skip it

Event guidance:
- In-person events with weather: weave in what to wear, bring, or when to leave
- Virtual meetings (Zoom/Meet/Teams): mention it casually with a quick productivity tip
- Events with no location (Exam, Presentation, Study, Interview): motivational nudge tied to the event

Good examples:
- "Cool and cloudy today — grab a jacket. You've got your flight at 9pm, so leave by 7. Safe travels!"
- "Hot one today, 90°F — stay hydrated. Study session at 3pm in Fremont, budget 20 min to get there."
- "Nice morning, no jacket needed. Presentation at 2pm — you've got this!"

Bad examples (never write like this):
- "Today you will experience partly cloudy conditions with temperatures in the mid-50s. It is advisable to bring a light jacket. Your study session is scheduled for 3:00 PM..."

Do not mention UV index or sunscreen. No "Good morning!" or "Have a great day!"`;

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
