import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
  Wind,
  type LucideIcon,
} from "lucide-react";

interface WeatherIconProps {
  condition: string;
  className?: string;
}

function getWeatherIcon(condition: string): LucideIcon {
  const normalized = (condition ?? "unknown").toLowerCase();

  if (normalized.includes("sunny") || normalized.includes("clear")) {
    return Sun;
  }
  if (normalized.includes("partly")) {
    return CloudSun;
  }
  if (normalized.includes("rain") || normalized.includes("drizzle")) {
    return CloudRain;
  }
  if (normalized.includes("thunder") || normalized.includes("storm")) {
    return CloudLightning;
  }
  if (normalized.includes("snow")) {
    return Snowflake;
  }
  if (normalized.includes("fog") || normalized.includes("mist")) {
    return CloudFog;
  }
  if (normalized.includes("wind")) {
    return Wind;
  }
  if (normalized.includes("cloud")) {
    return Cloud;
  }

  return CloudSun;
}

export default function WeatherIcon({
  condition,
  className = "h-5 w-5",
}: WeatherIconProps) {
  const Icon = getWeatherIcon(condition);

  return (
    <Icon
      className={className}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}
