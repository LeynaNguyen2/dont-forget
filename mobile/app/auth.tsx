import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { colors } from "@/constants/theme";
import { useAuth } from "@/lib/auth";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    cookie?: string | string[];
    error?: string | string[];
  }>();
  const { completeAuthCallback, refreshSession } = useAuth();

  useEffect(() => {
    async function handleCallback() {
      await completeAuthCallback(params);
      await refreshSession();
      router.replace("/");
    }

    void handleCallback();
  }, [completeAuthCallback, refreshSession, router, params]);

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
