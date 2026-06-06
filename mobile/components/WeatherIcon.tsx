import { Text, type TextStyle } from "react-native";

interface WeatherIconProps {
  condition: string;
  style?: TextStyle;
}

export default function WeatherIcon({ condition, style }: WeatherIconProps) {
  const normalized = condition.toLowerCase();

  let icon = "🌤️";
  if (normalized.includes("sunny") || normalized.includes("clear")) {
    icon = "☀️";
  } else if (normalized.includes("cloud")) {
    icon = "☁️";
  } else if (normalized.includes("rain") || normalized.includes("drizzle")) {
    icon = "🌧️";
  } else if (normalized.includes("thunder") || normalized.includes("storm")) {
    icon = "⛈️";
  } else if (normalized.includes("snow")) {
    icon = "🌨️";
  } else if (normalized.includes("fog") || normalized.includes("mist")) {
    icon = "🌫️";
  } else if (normalized.includes("wind")) {
    icon = "💨";
  }

  return <Text style={[{ fontSize: 40 }, style]}>{icon}</Text>;
}
