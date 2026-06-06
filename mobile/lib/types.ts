export interface WeatherData {
  temperatureF: number;
  condition: string;
  chanceOfRain: number;
  uvIndex: number;
  windSpeed: number;
}

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

export type Tab = "today" | "tomorrow";

export interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface Session {
  user?: SessionUser;
  expires?: string;
}
