const VIRTUAL_PATTERNS = [
  /zoom\.us/i,
  /meet\.google/i,
  /teams\.microsoft/i,
  /teams\.live\.com/i,
  /webex\.com/i,
];

export function isVirtualMeetingLocation(location: string): boolean {
  const trimmed = location.trim();
  if (!trimmed) {
    return false;
  }

  return VIRTUAL_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function formatEventLocation(
  location: string,
  displayName: string | null
): string {
  const candidates = [displayName, location].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (isVirtualMeetingLocation(candidate)) {
      return "Virtual";
    }
  }

  return displayName ?? location;
}
