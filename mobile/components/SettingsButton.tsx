import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "@/constants/theme";

const ICON_SIZE = 20;
const BUTTON_SIZE = 40;

export default function SettingsButton() {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
      onPress={() => router.push("/settings")}
      accessibilityLabel="Settings"
      accessibilityRole="button"
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name="settings-outline"
          size={ICON_SIZE}
          color={colors.slate500}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    flexShrink: 0,
    flexGrow: 0,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
});
