const HOME_LOCATION_KEY = "dont-forget-home-location";

export function getHomeLocation(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(HOME_LOCATION_KEY);
}

export function setHomeLocation(location: string): void {
  localStorage.setItem(HOME_LOCATION_KEY, location.trim());
}
