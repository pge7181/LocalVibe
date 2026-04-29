import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Image, ActivityIndicator, RefreshControl, Modal, Pressable, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { api } from "../../src/api";
import { useAuth } from "../../src/auth";
import { COLORS, RADIUS, SPACING, SHADOW } from "../../src/theme";

type Provider = {
  id: string; name: string; category: string; cities: string[]; cover: string; avatar: string;
  rating: number; review_count: number; price_min: number; price_max: number; verified: boolean;
};
type Cat = { key: string; icon: string };

const ICON_MAP: Record<string, any> = {
  Bakers: "ice-cream", "Makeup Artists": "color-palette", Decorators: "flower",
  Photographers: "camera", "Event Planners": "calendar", Caterers: "restaurant",
};

export default function Discover() {
  const router = useRouter();
  const { user } = useAuth();
  const [city, setCity] = useState("All");
  const [cities, setCities] = useState<string[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [featured, setFeatured] = useState<Provider[]>([]);
  const [trending, setTrending] = useState<Provider[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cityModal, setCityModal] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, ct, f, t] = await Promise.all([
        api.get("/meta/cities"),
        api.get("/meta/categories"),
        api.get(`/providers/featured${city !== "All" ? `?city=${encodeURIComponent(city)}` : ""}`),
        api.get(`/providers?sort=rating${city !== "All" ? `&city=${encodeURIComponent(city)}` : ""}`),
      ]);
      setCities(c.data); setCats(ct.data); setFeatured(f.data); setTrending(t.data.slice(0, 8));
    } finally { setLoading(false); }
  }, [city]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const submitSearch = () => {
    router.push({ pathname: "/(tabs)/search", params: { city: city !== "All" ? city : "", q: search } });
  };

  const goCategory = (cat: string) => {
    router.push({ pathname: "/(tabs)/search", params: { city: city !== "All" ? city : "", category: cat } });
  };

  if (loading) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator color={COLORS.primary} /></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Hey {user?.name?.split(" ")[0] || "there"} 👋</Text>
            <Text style={s.headerTitle}>Find your local creators</Text>
          </View>
          <TouchableOpacity testID="city-pill" style={s.cityPill} onPress={() => setCityModal(true)}>
            <Ionicons name="location" size={14} color={COLORS.primary} />
            <Text style={s.cityText}>{city}</Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Ionicons name="search" size={18} color={COLORS.textTertiary} />
          <TextInput testID="search-input" style={s.searchInput} placeholder="Search bakers, MUAs, photographers..."
            placeholderTextColor={COLORS.textTertiary} value={search} onChangeText={setSearch}
            onSubmitEditing={submitSearch} returnKeyType="search" />
        </View>

        {/* Categories */}
        <Text style={s.section}>Categories</Text>
        <View style={s.catGrid}>
          {cats.map((c) => (
            <TouchableOpacity testID={`cat-${c.key}`} key={c.key} style={s.catItem} onPress={() => goCategory(c.key)}>
              <View style={s.catIcon}><Ionicons name={ICON_MAP[c.key] || "sparkles"} size={26} color={COLORS.primary} /></View>
              <Text style={s.catLabel}>{c.key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured */}
        {featured.length > 0 && (
          <>
            <View style={s.sectionRow}>
              <Text style={s.section}>Trending {city !== "All" ? `in ${city}` : "creators"}</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/search", params: { city: city !== "All" ? city : "" } })}>
                <Text style={s.linkSm}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg, gap: 12 }}>
              {featured.map((p) => (
                <TouchableOpacity testID={`featured-${p.id}`} key={p.id} style={s.featCard} onPress={() => router.push(`/provider/${p.id}`)}>
                  <Image source={{ uri: p.cover }} style={s.featCover} />
                  {p.verified && <View style={s.verifiedBadge}><Ionicons name="checkmark-circle" size={12} color="#fff" /><Text style={s.verifiedTxt}>VERIFIED</Text></View>}
                  <View style={{ padding: 12 }}>
                    <Text style={s.featName} numberOfLines={1}>{p.name}</Text>
                    <Text style={s.featCat} numberOfLines={1}>{p.category} • {p.cities[0]}{p.cities.length > 1 ? ` +${p.cities.length - 1}` : ""}</Text>
                    <View style={s.metaRow}>
                      <Ionicons name="star" size={13} color={COLORS.star} />
                      <Text style={s.rating}>{p.rating.toFixed(1)}</Text>
                      <Text style={s.muted}> ({p.review_count})</Text>
                      <Text style={s.priceTag}>₹{p.price_min.toLocaleString("en-IN")}+</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Trending list */}
        <Text style={[s.section, { marginTop: 24 }]}>Top rated</Text>
        <View style={{ paddingHorizontal: SPACING.lg, gap: 10 }}>
          {trending.map((p) => (
            <TouchableOpacity testID={`top-${p.id}`} key={p.id} style={s.listCard} onPress={() => router.push(`/provider/${p.id}`)}>
              <Image source={{ uri: p.avatar || p.cover }} style={s.listAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={s.listName} numberOfLines={1}>{p.name}</Text>
                <Text style={s.listCat} numberOfLines={1}>{p.category} • {p.cities[0]}{p.cities.length > 1 ? ` +${p.cities.length - 1}` : ""}</Text>
                <View style={s.metaRow}>
                  <Ionicons name="star" size={12} color={COLORS.star} />
                  <Text style={s.rating}>{p.rating.toFixed(1)}</Text>
                  <Text style={s.muted}>  ₹{p.price_min.toLocaleString("en-IN")}+</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* City Modal */}
      <CityPickerModal
        visible={cityModal}
        current={city}
        suggestions={cities}
        onClose={() => setCityModal(false)}
        onSelect={(c) => { setCity(c); setCityModal(false); }}
      />
    </SafeAreaView>
  );
}

function CityPickerModal({ visible, current, suggestions, onClose, onSelect }: { visible: boolean; current: string; suggestions: string[]; onClose: () => void; onSelect: (c: string) => void }) {
  const [input, setInput] = useState("");
  const [locating, setLocating] = useState(false);
  const filtered = input.trim()
    ? suggestions.filter((c) => c.toLowerCase().includes(input.trim().toLowerCase()))
    : suggestions;
  const trimmed = input.trim();
  const showCustom = trimmed.length > 1 && !suggestions.some((c) => c.toLowerCase() === trimmed.toLowerCase());

  const detectLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Allow location access to auto-detect your city.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      let cityName: string | null = null;
      if (Platform.OS !== "web") {
        const places = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        const p = places[0];
        cityName = p?.city || p?.subregion || p?.region || null;
      }
      if (!cityName) {
        // Web or fallback: use Nominatim (OpenStreetMap) free reverse-geocoder
        const r = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const j = await r.json();
        cityName = j?.address?.city || j?.address?.town || j?.address?.village || j?.address?.county || j?.address?.state || null;
      }
      if (cityName) onSelect(cityName);
      else Alert.alert("Couldn't detect city", "Please type your city instead.");
    } catch (e: any) {
      Alert.alert("Location error", e?.message || "Try typing your city instead.");
    } finally { setLocating(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={ms.bg} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <Pressable style={ms.sheet}>
            <View style={ms.handle} />
            <Text style={ms.title}>Choose your city</Text>
            <View style={ms.inputWrap}>
              <Ionicons name="search" size={16} color={COLORS.textTertiary} />
              <TextInput
                testID="city-input"
                style={ms.input}
                placeholder="Type your city (any city in the world)"
                placeholderTextColor={COLORS.textTertiary}
                value={input}
                onChangeText={setInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => trimmed && onSelect(trimmed)}
              />
              {input.length > 0 && (
                <TouchableOpacity onPress={() => setInput("")}><Ionicons name="close-circle" size={16} color={COLORS.textTertiary} /></TouchableOpacity>
              )}
            </View>
            <TouchableOpacity testID="city-near-me" style={ms.nearMe} onPress={detectLocation} disabled={locating}>
              {locating ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Ionicons name="navigate" size={16} color={COLORS.primary} />}
              <Text style={ms.nearMeTxt}>{locating ? "Detecting your location..." : "Use my current location"}</Text>
            </TouchableOpacity>
            <ScrollView style={{ maxHeight: 320 }} keyboardShouldPersistTaps="handled">
              <TouchableOpacity testID="city-All" style={ms.row} onPress={() => onSelect("All")}>
                <Ionicons name="globe-outline" size={18} color={COLORS.textSecondary} />
                <Text style={[ms.rowTxt, current === "All" && { color: COLORS.primary, fontWeight: "700" }]}>All cities</Text>
                {current === "All" && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
              </TouchableOpacity>
              {showCustom && (
                <TouchableOpacity testID="city-custom" style={ms.row} onPress={() => onSelect(trimmed)}>
                  <Ionicons name="add-circle" size={18} color={COLORS.primary} />
                  <Text style={[ms.rowTxt, { color: COLORS.primary, fontWeight: "700" }]}>Use “{trimmed}”</Text>
                </TouchableOpacity>
              )}
              {filtered.length > 0 && <Text style={ms.section}>Popular cities</Text>}
              {filtered.map((c) => (
                <TouchableOpacity testID={`city-${c}`} key={c} style={ms.row} onPress={() => onSelect(c)}>
                  <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} />
                  <Text style={[ms.rowTxt, c === current && { color: COLORS.primary, fontWeight: "700" }]}>{c}</Text>
                  {c === current && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const ms = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: "flex-end" },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.xl, paddingBottom: 32 },
  handle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: 12 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, backgroundColor: COLORS.bg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: COLORS.text },
  nearMe: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, backgroundColor: COLORS.primaryMuted, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.primaryMuted },
  nearMeTxt: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  rowTxt: { flex: 1, fontSize: 15, color: COLORS.text },
  section: { fontSize: 11, fontWeight: "800", color: COLORS.textTertiary, textTransform: "uppercase", letterSpacing: 0.6, marginTop: 14, marginBottom: 4 },
});

const s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  greeting: { fontSize: 13, color: COLORS.textSecondary },
  headerTitle: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginTop: 2 },
  cityPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.border },
  cityText: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg, marginTop: 10, paddingHorizontal: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: COLORS.text },
  section: { fontSize: 17, fontWeight: "800", color: COLORS.text, marginHorizontal: SPACING.lg, marginTop: 22, marginBottom: 12 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 22, marginBottom: 12, paddingHorizontal: SPACING.lg },
  linkSm: { color: COLORS.primary, fontWeight: "700", fontSize: 13 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: SPACING.lg, gap: 12 },
  catItem: { width: "30%", alignItems: "center", paddingVertical: 12, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight },
  catIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: COLORS.primaryMuted, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  catLabel: { fontSize: 12, fontWeight: "600", color: COLORS.text, textAlign: "center" },
  featCard: { width: 240, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, overflow: "hidden", borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOW.card },
  featCover: { width: "100%", height: 140, backgroundColor: COLORS.borderLight },
  verifiedBadge: { position: "absolute", top: 10, left: 10, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.success, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm },
  verifiedTxt: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  featName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  featCat: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  rating: { fontSize: 13, fontWeight: "700", color: COLORS.text },
  muted: { fontSize: 12, color: COLORS.textSecondary },
  priceTag: { marginLeft: "auto", fontSize: 13, fontWeight: "700", color: COLORS.primary },
  listCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight },
  listAvatar: { width: 56, height: 56, borderRadius: 14, backgroundColor: COLORS.borderLight },
  listName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  listCat: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  modalBg: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: "flex-end" },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.xl, paddingBottom: 32 },
  sheetHandle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: 12 },
  cityRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  cityRowTxt: { flex: 1, fontSize: 15, color: COLORS.text },
});
