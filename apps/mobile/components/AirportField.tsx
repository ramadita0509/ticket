import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { AirportSuggestion } from "@ticket/shared";
import { suggestAirports } from "@/lib/api";
import { colors, spacing } from "@/constants/theme";

type Props = {
  label: string;
  value: string;
  onChange: (iata: string) => void;
  placeholder?: string;
};

export function AirportField({
  label,
  value,
  onChange,
  placeholder = "CGK",
}: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AirportSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setSuggestions([]);
      return;
    }
    // If user typed exact IATA, don't spam suggest
    if (/^[A-Za-z]{3}$/.test(q) && q.toUpperCase() === value) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const list = await suggestAirports(q);
        if (!cancelled) setSuggestions(list);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, value]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={query}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          onFocus={() => setOpen(true)}
          onChangeText={(text) => {
            setQuery(text);
            setOpen(true);
            if (/^[A-Za-z]{3}$/.test(text.trim())) {
              onChange(text.trim().toUpperCase());
            }
          }}
          onBlur={() => {
            // delay so suggestion press can register
            setTimeout(() => setOpen(false), 180);
          }}
        />
        {loading ? <ActivityIndicator color={colors.brand} /> : null}
      </View>
      {open && suggestions.length > 0 ? (
        <View style={styles.dropdown}>
          {suggestions.map((s) => (
            <Pressable
              key={`${s.iataCode}-${s.name}`}
              style={styles.suggestion}
              onPress={() => {
                onChange(s.iataCode);
                setQuery(s.iataCode);
                setSuggestions([]);
                setOpen(false);
              }}
            >
              <Text style={styles.code}>{s.iataCode}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {s.cityName ? `${s.cityName} · ` : ""}
                {s.name}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md, zIndex: 1 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.ink,
  },
  dropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  suggestion: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  code: {
    fontWeight: "800",
    color: colors.brand,
    width: 40,
  },
  name: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
  },
});
