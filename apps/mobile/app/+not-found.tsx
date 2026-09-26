import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Tidak ditemukan" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Halaman tidak ada.</Text>
        <Link href="/" style={styles.link}>
          Kembali ke pencarian
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
  },
  link: {
    marginTop: spacing.md,
    color: colors.brand,
    fontWeight: "700",
  },
});
