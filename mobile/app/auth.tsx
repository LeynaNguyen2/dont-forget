import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { colors } from "@/constants/theme";
import { useAuth } from "@/lib/auth";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { refreshSession } = useAuth();

  useEffect(() => {
    void refreshSession().finally(() => {
      router.replace("/");
    });
  }, [refreshSession, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
