const PREFERENCES_KEY = "dont-forget-preferences";
const LEGACY_HOME_LOCATION_KEY = "dont-forget-home-location";

export interface UserPreferences {
  homeAddress: string;
  carryWater: boolean;
  carryUmbrella: boolean;
  notificationTime: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  homeAddress: "",
  carryWater: false,
  carryUmbrella: false,
  notificationTime: "07:00",
};

function readPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return { ...DEFAULT_PREFERENCES };
  }

  const stored = localStorage.getItem(PREFERENCES_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Partial<UserPreferences>;
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
      };
    } catch {
      return { ...DEFAULT_PREFERENCES };
    }
  }

  const legacyHome = localStorage.getItem(LEGACY_HOME_LOCATION_KEY);
  if (legacyHome) {
    return {
      ...DEFAULT_PREFERENCES,
      homeAddress: legacyHome,
    };
  }

  return { ...DEFAULT_PREFERENCES };
}

export function getPreferences(): UserPreferences {
  return readPreferences();
}

export function savePreferences(preferences: UserPreferences): void {
  const normalized: UserPreferences = {
    homeAddress: preferences.homeAddress.trim(),
    carryWater: preferences.carryWater,
    carryUmbrella: preferences.carryUmbrella,
    notificationTime: preferences.notificationTime,
  };

  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(normalized));

  if (normalized.homeAddress) {
    localStorage.setItem(LEGACY_HOME_LOCATION_KEY, normalized.homeAddress);
  } else {
    localStorage.removeItem(LEGACY_HOME_LOCATION_KEY);
  }
}

export function getHomeLocation(): string | null {
  const address = readPreferences().homeAddress.trim();
  return address || null;
}

export function setHomeLocation(location: string): void {
  savePreferences({
    ...readPreferences(),
    homeAddress: location,
  });
}
