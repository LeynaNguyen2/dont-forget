import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api";
import {
  DEFAULT_PREFERENCES,
  getPreferences,
  savePreferences,
  type UserPreferences,
} from "@/lib/settings";

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void getPreferences().then(setPreferences);
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    await savePreferences(preferences);
    setSaved(true);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Home Address</Text>
          <Text style={styles.sectionDescription}>
            Used for weather when no events have locations.
          </Text>
          <TextInput
            style={styles.input}
            value={preferences.homeAddress}
            onChangeText={(text) => updatePreference("homeAddress", text)}
            placeholder="e.g. 123 Main St, San Francisco"
            placeholderTextColor={colors.slate400}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Remind me to carry water</Text>
            <Switch
              value={preferences.carryWater}
              onValueChange={(value) => updatePreference("carryWater", value)}
              trackColor={{ false: colors.slate400, true: colors.primary }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Remind me to carry umbrella</Text>
            <Switch
              value={preferences.carryUmbrella}
              onValueChange={(value) =>
                updatePreference("carryUmbrella", value)
              }
              trackColor={{ false: colors.slate400, true: colors.primary }}
            />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
          ]}
          onPress={() => void handleSave()}
        >
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        </Pressable>

        {saved && (
          <Text style={styles.savedText}>Preferences saved.</Text>
        )}

        <View style={styles.apiInfo}>
          <Text style={styles.apiInfoLabel}>API Server</Text>
          <Text style={styles.apiInfoValue}>{getApiBaseUrl()}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.signOutButtonPressed,
          ]}
          onPress={() => void handleSignOut()}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 20,
  },
  section: {
    borderRadius: 24,
    backgroundColor: colors.white,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.slate900,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.slate500,
    marginBottom: 12,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.slate900,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.slate700,
    marginRight: 12,
  },
  saveButton: {
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  savedText: {
    textAlign: "center",
    fontSize: 13,
    color: colors.slate500,
  },
  apiInfo: {
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: 16,
  },
  apiInfoLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.slate500,
    marginBottom: 4,
  },
  apiInfoValue: {
    fontSize: 13,
    color: colors.slate700,
  },
  signOutButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.red100,
    backgroundColor: colors.red50,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutButtonPressed: {
    opacity: 0.8,
  },
  signOutButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.red700,
  },
});
