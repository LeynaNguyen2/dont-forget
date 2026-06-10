import type { WeatherData } from "@/lib/weather";

function shortenLocation(location: string): string {
  const parts = location.split(",").map((part) => part.trim());
  if (parts.length >= 2 && parts[0].length < 40) {
    return parts[0];
  }
  return location.length > 32 ? `${location.slice(0, 32)}…` : location;
}

export function buildWeatherSummary(
  weather: WeatherData,
  location: string
): string {
  const place = shortenLocation(location);
  const { condition, chanceOfRain } = weather;

  let detail = "Comfortable conditions expected.";
  if (condition === "sunny" || condition === "clear") {
    detail = "Clear skies, staying sunny through the afternoon.";
  } else if (condition === "rain" || chanceOfRain > 50) {
    detail = `${chanceOfRain}% chance of rain — bring an umbrella.`;
  } else if (condition === "cloudy") {
    detail = "Partly cloudy with mild temperatures.";
  } else if (condition === "windy") {
    detail = "Breezy today — light jacket recommended.";
  }

  return `${weather.temperatureF}° now in ${place} · ${detail}`;
}
