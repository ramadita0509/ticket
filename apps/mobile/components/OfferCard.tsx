import { Pressable, StyleSheet, Text, View } from "react-native";
import type { FlightOffer } from "@ticket/shared";
import { formatMoney, formatTime } from "@/lib/api";
import { colors, spacing } from "@/constants/theme";

type Props = {
  offer: FlightOffer;
  onPress: () => void;
};

export function OfferCard({ offer, onPress }: Props) {
  const first = offer.segments[0];
  const last = offer.segments[offer.segments.length - 1];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.top}>
        <Text style={styles.airline}>{offer.airlineCodes.join(" · ")}</Text>
        <Text style={styles.price}>
          {formatMoney(offer.price.amount, offer.price.currency)}
        </Text>
      </View>
      <View style={styles.route}>
        <View style={styles.col}>
          <Text style={styles.time}>{formatTime(first?.departAt ?? "")}</Text>
          <Text style={styles.iata}>{first?.from ?? "—"}</Text>
        </View>
        <View style={styles.mid}>
          <Text style={styles.duration}>{offer.totalDuration || "—"}</Text>
          <View style={styles.line} />
          <Text style={styles.stops}>
            {offer.stops === 0 ? "Langsung" : `${offer.stops} transit`}
          </Text>
        </View>
        <View style={[styles.col, styles.colEnd]}>
          <Text style={styles.time}>{formatTime(last?.arriveAt ?? "")}</Text>
          <Text style={styles.iata}>{last?.to ?? "—"}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  airline: {
    fontWeight: "700",
    color: colors.brand,
    fontSize: 15,
  },
  price: {
    fontWeight: "800",
    color: colors.ink,
    fontSize: 16,
  },
  route: {
    flexDirection: "row",
    alignItems: "center",
  },
  col: { minWidth: 64 },
  colEnd: { alignItems: "flex-end" },
  time: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
  },
  iata: {
    marginTop: 2,
    color: colors.muted,
    fontWeight: "600",
  },
  mid: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  duration: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  line: {
    height: 2,
    alignSelf: "stretch",
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  stops: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
});
