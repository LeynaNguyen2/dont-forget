const PREFERENCES_KEY = "dont-forget-preferences";
const LEGACY_HOME_LOCATION_KEY = "dont-forget-home-location";

export interface UserPreferences {
  homeAddress: string;
  carryWater: boolean;
  carryUmbrella: boolean;
  notificationTime: string;
  morningBriefingEnabled: boolean;
  activeDays: boolean[];
  enabledCalendars: Record<string, boolean>;
}

export const DEFAULT_ACTIVE_DAYS = [false, true, true, true, true, true, false];

export const DEFAULT_PREFERENCES: UserPreferences = {
  homeAddress: "",
  carryWater: false,
  carryUmbrella: false,
  notificationTime: "07:00",
  morningBriefingEnabled: true,
  activeDays: [...DEFAULT_ACTIVE_DAYS],
  enabledCalendars: {},
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
        activeDays:
          Array.isArray(parsed.activeDays) && parsed.activeDays.length === 7
            ? parsed.activeDays
            : DEFAULT_PREFERENCES.activeDays,
        enabledCalendars: parsed.enabledCalendars ?? {},
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
    morningBriefingEnabled: preferences.morningBriefingEnabled,
    activeDays:
      preferences.activeDays.length === 7
        ? preferences.activeDays
        : DEFAULT_PREFERENCES.activeDays,
    enabledCalendars: preferences.enabledCalendars,
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

export function getEnabledCalendarIds(
  calendarIds: string[],
  preferences: UserPreferences = readPreferences()
): string[] {
  const { enabledCalendars } = preferences;
  const hasOverrides = Object.keys(enabledCalendars).length > 0;

  if (!hasOverrides) {
    return calendarIds;
  }

  const enabled = calendarIds.filter((id) => enabledCalendars[id] !== false);
  return enabled.length > 0 ? enabled : calendarIds;
}
