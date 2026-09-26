import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { AirportField } from "@/components/AirportField";
import { colors, spacing } from "@/constants/theme";
import { searchFlights } from "@/lib/api";
import { setSearchResults } from "@/lib/search-store";

function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

export default function SearchScreen() {
  const router = useRouter();
  const [origin, setOrigin] = useState("CGK");
  const [destination, setDestination] = useState("DPS");
  const [departureDate, setDepartureDate] = useState(defaultDate());
  const [adults, setAdults] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSearch = useMemo(() => {
    return (
      /^[A-Z]{3}$/.test(origin) &&
      /^[A-Z]{3}$/.test(destination) &&
      origin !== destination &&
      /^\d{4}-\d{2}-\d{2}$/.test(departureDate) &&
      Number(adults) >= 1
    );
  }, [origin, destination, departureDate, adults]);

  async function onSearch() {
    if (!canSearch || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await searchFlights({
        origin,
        destination,
        departureDate,
        adults: Number(adults) || 1,
      });
      setSearchResults(result.offers, {
        demo: result.demo,
        searchId: result.searchId,
      });
      router.push({
        pathname: "/results",
        params: {
          origin,
          destination,
          departureDate,
          demo: result.demo ? "1" : "0",
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mencari penerbangan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={styles.brand}>Ticket</Text>
          <Text style={styles.tagline}>
            Cari harga penerbangan langsung dari API partner — simple, cepat.
          </Text>
        </View>

        <View style={styles.form}>
          <AirportField
            label="Dari"
            value={origin}
            onChange={setOrigin}
            placeholder="CGK"
          />
          <AirportField
            label="Ke"
            value={destination}
            onChange={setDestination}
            placeholder="DPS"
          />

          <Text style={styles.label}>Tanggal berangkat</Text>
          <TextInput
            style={styles.input}
            value={departureDate}
            onChangeText={setDepartureDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Penumpang dewasa</Text>
          <TextInput
            style={styles.input}
            value={adults}
            onChangeText={setAdults}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={colors.muted}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.cta, (!canSearch || loading) && styles.ctaDisabled]}
            disabled={!canSearch || loading}
            onPress={onSearch}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>Cari penerbangan</Text>
            )}
          </Pressable>

          <Text style={styles.disclaimer}>
            Harga indikatif. Booking final via partner (MVP search-only).
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  hero: {
    backgroundColor: colors.brand,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  brand: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: spacing.sm,
    color: "#D7E8EC",
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.ink,
    marginBottom: spacing.md,
    backgroundColor: colors.bg,
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: {
    color: colors.accentInk,
    fontWeight: "800",
    fontSize: 16,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  disclaimer: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
    textAlign: "center",
  },
});
