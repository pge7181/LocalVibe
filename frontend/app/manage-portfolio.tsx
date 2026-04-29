import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, formatErr } from "../src/api";
import { useAuth } from "../src/auth";
import { pickPortfolioImages } from "../src/imagePicker";
import { COLORS, RADIUS, SPACING } from "../src/theme";

export default function ManagePortfolio() {
  const router = useRouter();
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.provider_id) {
      setLoading(false);
      return;
    }
    api.get(`/providers/${user.provider_id}`)
      .then((r) => setPortfolio(r.data.portfolio || []))
      .catch(() => Alert.alert("Error", "Could not load portfolio"))
      .finally(() => setLoading(false));
  }, [user]);

  const addImages = async () => {
    const remaining = 12 - portfolio.length;
    if (remaining <= 0) return Alert.alert("Limit reached", "Maximum 12 portfolio photos.");
    const imgs = await pickPortfolioImages(remaining);
    if (imgs.length) setPortfolio([...portfolio, ...imgs].slice(0, 12));
  };

  const remove = (i: number) =>
    Alert.alert("Remove photo?", "", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setPortfolio(portfolio.filter((_, idx) => idx !== i)) },
    ]);

  const save = async () => {
    if (portfolio.length < 6) return Alert.alert("Need at least 6 photos", `You have ${portfolio.length}. Add ${6 - portfolio.length} more.`);
    setSaving(true);
    try {
      await api.put("/providers/me", {
        portfolio,
        avatar: portfolio[0],
        cover: portfolio[0],
      });
      Alert.alert("Saved", "Your portfolio is updated.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("Save failed", formatErr(e));
    } finally { setSaving(false); }
  };

  if (loading) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator color={COLORS.primary} /></View>;
  if (!user?.provider_id) {
    return (
      <SafeAreaView style={s.empty}>
        <Ionicons name="alert-circle-outline" size={42} color={COLORS.textTertiary} />
        <Text style={s.emptyTxt}>Create your provider profile first</Text>
        <TouchableOpacity style={s.btn} onPress={() => router.replace("/provider-onboarding")}><Text style={s.btnTxt}>Set up profile</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={s.header}>
        <TouchableOpacity testID="mp-back" onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={COLORS.text} /></TouchableOpacity>
        <Text style={s.title}>Manage Portfolio</Text>
        <TouchableOpacity testID="mp-save" onPress={save} disabled={saving}>
          <Text style={[s.saveBtn, saving && { opacity: 0.5 }]}>{saving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 60 }}>
        <Text style={s.intro}>Showcase your best & most-liked work. The first photo becomes your cover & avatar.</Text>
        <View style={s.grid}>
          {portfolio.map((uri, i) => (
            <TouchableOpacity testID={`mp-tile-${i}`} key={`${i}-${uri.slice(-20)}`} style={s.tile} onPress={() => remove(i)}>
              <Image source={{ uri }} style={s.img} />
              {i === 0 && <View style={s.coverBadge}><Text style={s.coverBadgeTxt}>COVER</Text></View>}
              <View style={s.removeBadge}><Ionicons name="close" size={14} color="#fff" /></View>
            </TouchableOpacity>
          ))}
          {portfolio.length < 12 && (
            <TouchableOpacity testID="mp-add" style={[s.tile, s.addTile]} onPress={addImages}>
              <Ionicons name="add" size={32} color={COLORS.primary} />
              <Text style={s.addTxt}>{portfolio.length === 0 ? "Add photos" : "Add more"}</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={[s.counter, { color: portfolio.length >= 6 ? COLORS.success : COLORS.warning }]}>
          {portfolio.length >= 6 ? `✓ ${portfolio.length}/12 photos` : `${portfolio.length}/6 minimum (add ${6 - portfolio.length} more)`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  title: { fontSize: 17, fontWeight: "800", color: COLORS.text },
  saveBtn: { fontSize: 15, fontWeight: "800", color: COLORS.primary },
  intro: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: { width: "31%", aspectRatio: 1, borderRadius: RADIUS.md, overflow: "hidden", position: "relative" },
  img: { width: "100%", height: "100%" },
  coverBadge: { position: "absolute", bottom: 4, left: 4, backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  coverBadgeTxt: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  removeBadge: { position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  addTile: { borderWidth: 2, borderColor: COLORS.primaryMuted, borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: COLORS.surface, gap: 4 },
  addTxt: { fontSize: 11, fontWeight: "700", color: COLORS.primary },
  counter: { fontSize: 13, fontWeight: "700", marginTop: 14, textAlign: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12, backgroundColor: COLORS.bg },
  emptyTxt: { fontSize: 16, fontWeight: "700", color: COLORS.text, textAlign: "center" },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 28, borderRadius: RADIUS.md, marginTop: 8 },
  btnTxt: { color: "#fff", fontWeight: "700" },
});
