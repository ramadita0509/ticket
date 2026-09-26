import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { OfferCard } from "@/components/OfferCard";
import { colors, spacing } from "@/constants/theme";
import { getSearchResults } from "@/lib/search-store";
import type { FlightOffer } from "@ticket/shared";

type SortKey = "price" | "duration";

function durationMinutes(offer: FlightOffer): number {
  const raw = offer.totalDuration || "";
  const h = Number(raw.match(/(\d+)j/)?.[1] ?? 0);
  const m = Number(raw.match(/(\d+)m/)?.[1] ?? 0);
  return h * 60 + m;
}

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    origin?: string;
    destination?: string;
    departureDate?: string;
    demo?: string;
  }>();
  const { offers, meta } = getSearchResults();
  const [sort, setSort] = useState<SortKey>("price");

  const sorted = useMemo(() => {
    const list = [...offers];
    if (sort === "price") {
      list.sort((a, b) => Number(a.price.amount) - Number(b.price.amount));
    } else {
      list.sort((a, b) => durationMinutes(a) - durationMinutes(b));
    }
    return list;
  }, [offers, sort]);

  const isDemo = params.demo === "1" || meta.demo;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.route}>
          {params.origin ?? "—"} → {params.destination ?? "—"}
        </Text>
        <Text style={styles.meta}>
          {params.departureDate ?? ""} · {sorted.length} opsi
        </Text>
        {isDemo ? (
          <Text style={styles.demoBanner}>
            Mode demo — set kredensial Amadeus di API untuk harga live.
          </Text>
        ) : null}
        <View style={styles.sortRow}>
          <SortChip
            label="Harga termurah"
            active={sort === "price"}
            onPress={() => setSort("price")}
          />
          <SortChip
            label="Durasi terpendek"
            active={sort === "duration"}
            onPress={() => setSort("duration")}
          />
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Tidak ada hasil. Kembali dan coba tanggal atau rute lain.
          </Text>
        }
        renderItem={({ item }) => (
          <OfferCard
            offer={item}
            onPress={() =>
              router.push({ pathname: "/offer/[id]", params: { id: item.id } })
            }
          />
        )}
      />
    </View>
  );
}

function SortChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  route: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
  },
  meta: {
    marginTop: 4,
    color: colors.muted,
  },
  demoBanner: {
    marginTop: spacing.sm,
    backgroundColor: "#FFF6E0",
    color: colors.accentInk,
    padding: spacing.sm,
    borderRadius: 10,
    overflow: "hidden",
    fontSize: 13,
  },
  sortRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipText: { color: colors.muted, fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: "#fff" },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  empty: {
    marginTop: spacing.xl,
    textAlign: "center",
    color: colors.muted,
  },
});
