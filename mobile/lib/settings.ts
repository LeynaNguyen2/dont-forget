import AsyncStorage from "@react-native-async-storage/async-storage";

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

async function readPreferences(): Promise<UserPreferences> {
  const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
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

  const legacyHome = await AsyncStorage.getItem(LEGACY_HOME_LOCATION_KEY);
  if (legacyHome) {
    return {
      ...DEFAULT_PREFERENCES,
      homeAddress: legacyHome,
    };
  }

  return { ...DEFAULT_PREFERENCES };
}

export async function getPreferences(): Promise<UserPreferences> {
  return readPreferences();
}

export async function savePreferences(
  preferences: UserPreferences
): Promise<void> {
  const normalized: UserPreferences = {
    homeAddress: preferences.homeAddress.trim(),
    carryWater: preferences.carryWater,
    carryUmbrella: preferences.carryUmbrella,
    notificationTime: preferences.notificationTime,
  };

  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(normalized));

  if (normalized.homeAddress) {
    await AsyncStorage.setItem(
      LEGACY_HOME_LOCATION_KEY,
      normalized.homeAddress
    );
  } else {
    await AsyncStorage.removeItem(LEGACY_HOME_LOCATION_KEY);
  }
}

export async function getHomeLocation(): Promise<string | null> {
  const address = (await readPreferences()).homeAddress.trim();
  return address || null;
}
