import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../src/api";
import { COLORS, RADIUS, SPACING, SHADOW } from "../../src/theme";

type Provider = {
  id: string; name: string; category: string; city: string; cover: string; avatar: string;
  rating: number; review_count: number; price_min: number; price_max: number; verified: boolean;
};

const SORTS = [
  { key: "rating", label: "Top rated" },
  { key: "price_low", label: "Price: low" },
  { key: "price_high", label: "Price: high" },
  { key: "recent", label: "Recent" },
];

export default function Search() {
  const params = useLocalSearchParams<{ city?: string; category?: string; q?: string }>();
  const router = useRouter();
  const [q, setQ] = useState(params.q || "");
  const [city, setCity] = useState(params.city || "");
  const [category, setCategory] = useState(params.category || "");
  const [sort, setSort] = useState("rating");
  const [items, setItems] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<string[]>([]);
  const [cats, setCats] = useState<{ key: string }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (city) qs.append("city", city);
      if (category) qs.append("category", category);
      if (q) qs.append("q", q);
      qs.append("sort", sort);
      const { data } = await api.get(`/providers?${qs.toString()}`);
      setItems(data);
    } finally { setLoading(false); }
  }, [q, city, category, sort]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.get("/meta/cities").then((r) => setCities(r.data));
    api.get("/meta/categories").then((r) => setCats(r.data));
  }, []);

  const Chip = ({ active, onPress, children, testID }: any) => (
    <TouchableOpacity testID={testID} style={[s.chip, active && s.chipActive]} onPress={onPress}>
      <Text style={[s.chipTxt, active && s.chipTxtActive]}>{children}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={["top"]}>
      <View style={s.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textTertiary} />
        <TextInput testID="search-tab-input" style={s.searchInput} placeholder="Search creators..."
          placeholderTextColor={COLORS.textTertiary} value={q} onChangeText={setQ} returnKeyType="search" />
        {q.length > 0 && <TouchableOpacity onPress={() => setQ("")}><Ionicons name="close-circle" size={18} color={COLORS.textTertiary} /></TouchableOpacity>}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
        <Chip testID="filter-city-all" active={!city} onPress={() => setCity("")}>All cities</Chip>
        {cities.map((c) => <Chip testID={`filter-city-${c}`} key={c} active={city === c} onPress={() => setCity(city === c ? "" : c)}>{c}</Chip>)}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
        <Chip testID="filter-cat-all" active={!category} onPress={() => setCategory("")}>All categories</Chip>
        {cats.map((c) => <Chip testID={`filter-cat-${c.key}`} key={c.key} active={category === c.key} onPress={() => setCategory(category === c.key ? "" : c.key)}>{c.key}</Chip>)}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
        {SORTS.map((srt) => <Chip testID={`sort-${srt.key}`} key={srt.key} active={sort === srt.key} onPress={() => setSort(srt.key)}>{srt.label}</Chip>)}
      </ScrollView>

      {loading ? (
        <View style={{ padding: 40 }}><ActivityIndicator color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: SPACING.lg, gap: 12, paddingBottom: 40 }}
          ListEmptyComponent={<View style={s.empty}><Ionicons name="search" size={36} color={COLORS.textTertiary} /><Text style={s.emptyTxt}>No creators match your filters</Text></View>}
          renderItem={({ item }) => (
            <TouchableOpacity testID={`result-${item.id}`} style={s.card} onPress={() => router.push(`/provider/${item.id}`)}>
              <Image source={{ uri: item.cover }} style={s.cover} />
              {item.verified && <View style={s.badge}><Ionicons name="checkmark-circle" size={12} color="#fff" /><Text style={s.badgeTxt}>VERIFIED</Text></View>}
              <View style={{ padding: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Image source={{ uri: item.avatar }} style={s.av} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
                    <Text style={s.cardCat}>{item.category} • {item.city}</Text>
                  </View>
                  <View style={s.ratingPill}><Ionicons name="star" size={12} color={COLORS.star} /><Text style={s.ratingTxt}>{item.rating.toFixed(1)}</Text></View>
                </View>
                <View style={s.priceRow}>
                  <Text style={s.priceLabel}>Starts at</Text>
                  <Text style={s.priceVal}>₹{item.price_min.toLocaleString("en-IN")}</Text>
                  <Text style={s.reviews}>{item.review_count} reviews</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg, marginTop: SPACING.sm, paddingHorizontal: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: COLORS.text },
  filterRow: { paddingHorizontal: SPACING.lg, paddingVertical: 8, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  chipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryMuted },
  chipTxt: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  chipTxtActive: { color: COLORS.primary },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, overflow: "hidden", borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOW.card },
  cover: { width: "100%", height: 160, backgroundColor: COLORS.borderLight },
  badge: { position: "absolute", top: 12, left: 12, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.success, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm },
  badgeTxt: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  av: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.borderLight },
  cardName: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  cardCat: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  ratingPill: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: COLORS.primaryMuted, borderRadius: RADIUS.sm },
  ratingTxt: { fontSize: 12, fontWeight: "700", color: COLORS.text },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  priceLabel: { fontSize: 12, color: COLORS.textSecondary },
  priceVal: { fontSize: 15, fontWeight: "800", color: COLORS.primary },
  reviews: { marginLeft: "auto", fontSize: 12, color: COLORS.textSecondary },
  empty: { alignItems: "center", padding: 40, gap: 8 },
  emptyTxt: { color: COLORS.textSecondary, fontSize: 14 },
});
