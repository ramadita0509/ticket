import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/theme";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.brand },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Ticket", headerLargeTitle: false }}
        />
        <Stack.Screen name="results" options={{ title: "Hasil pencarian" }} />
        <Stack.Screen name="offer/[id]" options={{ title: "Detail penerbangan" }} />
        <Stack.Screen name="handoff" options={{ title: "Lanjut pesan" }} />
      </Stack>
    </>
  );
}
