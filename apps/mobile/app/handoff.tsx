import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { colors, spacing } from "@/constants/theme";
import { formatMoney } from "@/lib/api";

export default function HandoffScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    offerId?: string;
    bookingUrl?: string;
    price?: string;
    currency?: string;
    airline?: string;
  }>();
  const [linkError, setLinkError] = useState<string | null>(null);

  const bookingUrl = (params.bookingUrl ?? "").trim();
  const hasPartnerLink = Boolean(bookingUrl);

  async function openPartner() {
    setLinkError(null);
    try {
      const can = await Linking.canOpenURL(bookingUrl);
      if (!can) {
        setLinkError("URL partner tidak bisa dibuka di perangkat ini.");
        return;
      }
      await WebBrowser.openBrowserAsync(bookingUrl);
    } catch {
      setLinkError("Gagal membuka link partner.");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {hasPartnerLink ? "Lanjut ke partner" : "Partner belum terhubung"}
        </Text>
        <Text style={styles.body}>
          {hasPartnerLink
            ? "Kamu akan dialihkan ke halaman booking partner untuk menyelesaikan pembayaran dan e-ticket."
            : "MVP search + harga sudah jalan. Saat kontrak partner siap, deep link booking akan muncul di tombol ini tanpa ubah UI."}
        </Text>

        <View style={styles.metaBox}>
          <MetaRow label="Offer" value={params.offerId ?? "—"} />
          <MetaRow label="Maskapai" value={params.airline ?? "—"} />
          <MetaRow
            label="Harga"
            value={
              params.price && params.currency
                ? formatMoney(params.price, params.currency)
                : "—"
            }
          />
        </View>

        {hasPartnerLink ? (
          <Pressable style={styles.cta} onPress={openPartner}>
            <Text style={styles.ctaText}>Buka booking partner</Text>
          </Pressable>
        ) : (
          <View style={styles.waitBox}>
            <Text style={styles.waitTitle}>Booking via partner segera</Text>
            <Text style={styles.waitBody}>
              Sementara ini kamu bisa pakai hasil harga untuk bandingkan opsi.
              Hubungkan adapter partner (isi field bookingUrl) untuk handoff
              otomatis.
            </Text>
          </View>
        )}

        {linkError ? <Text style={styles.error}>{linkError}</Text> : null}

        <Pressable style={styles.secondary} onPress={() => router.back()}>
          <Text style={styles.secondaryText}>Kembali ke detail</Text>
        </Pressable>
      </View>
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.ink,
  },
  body: {
    marginTop: spacing.sm,
    color: colors.muted,
    lineHeight: 22,
  },
  metaBox: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.brandSoft,
    borderRadius: 14,
    padding: spacing.md,
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  metaLabel: { color: colors.muted, fontWeight: "600" },
  metaValue: {
    color: colors.ink,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
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
  waitBox: {
    backgroundColor: "#FFF6E0",
    borderRadius: 14,
    padding: spacing.md,
  },
  waitTitle: {
    fontWeight: "800",
    color: colors.accentInk,
    marginBottom: 6,
  },
  waitBody: {
    color: colors.accentInk,
    lineHeight: 20,
    fontSize: 14,
  },
  secondary: {
    marginTop: spacing.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryText: {
    color: colors.brand,
    fontWeight: "700",
  },
  error: {
    marginTop: spacing.sm,
    color: colors.danger,
    textAlign: "center",
  },
});
