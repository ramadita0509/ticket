import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { FlightOffer } from "@ticket/shared";
import { colors, spacing } from "@/constants/theme";
import { formatMoney, formatTime, getOffer } from "@/lib/api";
import { getCachedOffer } from "@/lib/search-store";

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [offer, setOffer] = useState<FlightOffer | null>(
    id ? getCachedOffer(id) ?? null : null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!offer);

  useEffect(() => {
    if (!id || offer) return;
    let cancelled = false;
    (async () => {
      try {
        const remote = await getOffer(id);
        if (!cancelled) setOffer(remote);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Offer tidak ditemukan / expired"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, offer]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  if (!offer) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error ?? "Offer tidak tersedia"}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.priceBox}>
        <Text style={styles.priceLabel}>Harga indikatif</Text>
        <Text style={styles.price}>
          {formatMoney(offer.price.amount, offer.price.currency)}
        </Text>
        <Text style={styles.sub}>
          {offer.airlineCodes.join(" · ")}
          {offer.cabin ? ` · ${offer.cabin}` : ""}
          {offer.seatsLeft != null ? ` · sisa ${offer.seatsLeft} kursi` : ""}
        </Text>
      </View>

      <Text style={styles.section}>Itinerary</Text>
      {offer.segments.map((seg, idx) => (
        <View key={`${seg.flightNumber}-${idx}`} style={styles.segment}>
          <Text style={styles.flightNo}>{seg.flightNumber}</Text>
          <Text style={styles.segLine}>
            {formatTime(seg.departAt)} {seg.from} → {formatTime(seg.arriveAt)}{" "}
            {seg.to}
          </Text>
          <Text style={styles.segMeta}>Durasi segmen: {seg.duration || "—"}</Text>
        </View>
      ))}

      <Text style={styles.total}>
        Total durasi: {offer.totalDuration || "—"} ·{" "}
        {offer.stops === 0 ? "Langsung" : `${offer.stops} transit`}
      </Text>

      <Pressable
        style={styles.cta}
        onPress={() =>
          router.push({
            pathname: "/handoff",
            params: {
              offerId: offer.id,
              bookingUrl: offer.bookingUrl ?? "",
              price: offer.price.amount,
              currency: offer.price.currency,
              airline: offer.airlineCodes.join(","),
            },
          })
        }
      >
        <Text style={styles.ctaText}>Pesan</Text>
      </Pressable>

      <Text style={styles.note}>
        MVP A: pembayaran & e-ticket dilakukan di sisi partner. Tombol Pesan
        akan membuka deep link partner bila sudah tersedia.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  error: { color: colors.danger, textAlign: "center" },
  priceBox: {
    backgroundColor: colors.brand,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  priceLabel: { color: "#D7E8EC", fontSize: 13 },
  price: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 4,
  },
  sub: { color: "#D7E8EC", marginTop: 8 },
  section: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  segment: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  flightNo: { fontWeight: "800", color: colors.brand },
  segLine: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  segMeta: { marginTop: 4, color: colors.muted },
  total: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    color: colors.muted,
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: {
    color: colors.accentInk,
    fontWeight: "800",
    fontSize: 16,
  },
  note: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
    textAlign: "center",
  },
});
