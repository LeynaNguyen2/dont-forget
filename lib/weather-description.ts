import type { WeatherData } from "@/lib/weather";

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function buildWeatherSummary(
  weather: WeatherData,
  location: string
): string {
  const temp = weather.temperatureF;
  const condition = weather.condition;

  let detail = `${capitalize(condition)} skies`;
  if (condition === "sunny" || condition === "clear") {
    detail = "Clear skies this morning, staying sunny through the afternoon";
  } else if (condition === "rain" || weather.chanceOfRain > 50) {
    detail = `${weather.chanceOfRain}% chance of rain — keep an umbrella handy`;
  } else if (condition === "cloudy") {
    detail = "Partly cloudy with comfortable temperatures";
  }

  const wind =
    weather.windSpeed > 12
      ? " Breezy conditions expected."
      : condition === "sunny"
        ? " Light breeze."
        : "";

  return `${temp}° now in ${location} · ${detail}.${wind}`;
}
