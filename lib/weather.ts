export interface WeatherData {
  temperatureF: number;
  condition: string;
  chanceOfRain: number;
  uvIndex: number;
  windSpeed: number;
}

interface OneCallWeatherEntry {
  main: string;
  description: string;
}

interface OneCallCurrent {
  temp: number;
  uvi?: number;
  wind_speed: number;
  weather: OneCallWeatherEntry[];
}

interface OneCallHourly {
  pop?: number;
}

interface OneCallResponse {
  current?: OneCallCurrent;
  hourly?: OneCallHourly[];
}

function normalizeCondition(main: string, description: string): string {
  const conditionMap: Record<string, string> = {
    Clear: "sunny",
    Clouds: "cloudy",
    Rain: "rain",
    Drizzle: "rain",
    Thunderstorm: "thunderstorm",
    Snow: "snow",
    Mist: "foggy",
    Smoke: "foggy",
    Haze: "foggy",
    Dust: "foggy",
    Fog: "foggy",
    Sand: "foggy",
    Ash: "foggy",
    Squall: "windy",
    Tornado: "stormy",
  };

  return conditionMap[main] ?? description.toLowerCase();
}

function getChanceOfRain(hourly: OneCallHourly[] | undefined): number {
  const pop = hourly?.[0]?.pop;
  if (pop === undefined) {
    return 0;
  }

  return Math.round(pop * 100);
}

function redactApiKey(url: string, apiKey: string): string {
  return url.replaceAll(apiKey, "[REDACTED]");
}

export async function getWeather(
  lat: number,
  lon: number
): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_KEY;
  if (!apiKey) {
    console.error("[weather] OPENWEATHER_KEY is not set");
    return null;
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    units: "imperial",
    exclude: "minutely,daily,alerts",
    appid: apiKey,
  });

  const url = `https://api.openweathermap.org/data/3.0/onecall?${params}`;

  console.error("[weather] Request URL:", redactApiKey(url, apiKey));
  console.error("[weather] Coordinates:", { lat, lon });

  try {
    const response = await fetch(url);
    const responseText = await response.text();

    console.error("[weather] Response status:", response.status);
    console.error("[weather] Response body:", responseText);

    if (!response.ok) {
      console.error(
        `[weather] API request failed for lat=${lat}, lon=${lon} with status ${response.status}`
      );
      return null;
    }

    let data: OneCallResponse;
    try {
      data = JSON.parse(responseText) as OneCallResponse;
    } catch (parseError) {
      console.error("[weather] Failed to parse response JSON:", parseError);
      return null;
    }

    const current = data.current;
    const weatherEntry = current?.weather?.[0];

    if (!current || !weatherEntry) {
      console.error(
        "[weather] Missing current weather data in API response:",
        data
      );
      return null;
    }

    return {
      temperatureF: Math.round(current.temp),
      condition: normalizeCondition(weatherEntry.main, weatherEntry.description),
      chanceOfRain: getChanceOfRain(data.hourly),
      uvIndex: current.uvi ?? 0,
      windSpeed: Math.round(current.wind_speed),
    };
  } catch (error) {
    console.error(
      `[weather] Request failed for lat=${lat}, lon=${lon}:`,
      error
    );
    return null;
  }
}
