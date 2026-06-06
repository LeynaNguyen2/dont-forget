import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/theme";

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.red100,
    backgroundColor: colors.red50,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    fontSize: 14,
    color: colors.red700,
  },
});
