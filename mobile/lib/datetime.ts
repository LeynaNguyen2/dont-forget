export function formatEventTime(
  iso: string,
  timezone: string | null
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  if (!timezone) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(date);
}

export function capitalize(text: string | undefined): string {
  if (!text) {
    return "Unknown";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getDeviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
