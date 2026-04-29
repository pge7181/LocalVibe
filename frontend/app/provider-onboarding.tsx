import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, formatErr } from "../src/api";
import { useAuth } from "../src/auth";
import { COLORS, RADIUS, SPACING } from "../src/theme";

export default function Onboarding() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [cats, setCats] = useState<{ key: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [name, setName] = useState(user?.name || "");
  const [category, setCategory] = useState("Bakers");
  const [city, setCity] = useState("Delhi");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/meta/categories").then((r) => setCats(r.data));
    api.get("/meta/cities").then((r) => setCities(r.data));
  }, []);

  const submit = async () => {
    if (!name || !phone || !priceMin || !priceMax || !bio) return Alert.alert("Missing fields", "Please fill all required fields");
    setBusy(true);
    try {
      await api.post("/providers", {
        name, category, city, bio,
        avatar: "https://images.unsplash.com/photo-1759840278381-bf7d5e332050?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjB3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwwfHx8fDE3Nzc0NDAwMDl8MA&ixlib=rb-4.1.0&q=85",
        cover: "https://images.unsplash.com/photo-1671450632893-9b6ec834f492?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwbWFrZXVwJTIwYnJpZGV8ZW58MHx8fHwxNzc3NDQwMDAzfDA&ixlib=rb-4.1.0&q=85",
        phone, whatsapp: phone, instagram,
        portfolio: [],
        services: [],
        price_min: Number(priceMin), price_max: Number(priceMax),
      });
      await refresh();
      Alert.alert("Profile created!", "You're now live on LocalVibe.", [{ text: "OK", onPress: () => router.replace("/(tabs)") }]);
    } catch (e: any) {
      Alert.alert("Failed", formatErr(e));
    } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={COLORS.text} /></TouchableOpacity>
          <Text style={s.title}>Create Provider Profile</Text>
          <View style={{ width: 22 }} />
        </View>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Text style={s.intro}>Tell potential clients about what you do</Text>

          <Text style={s.label}>Brand / Business Name *</Text>
          <TextInput testID="ob-name" style={s.input} value={name} onChangeText={setName} placeholder="e.g. Sweets by Mira" placeholderTextColor={COLORS.textTertiary} />

          <Text style={s.label}>Category *</Text>
          <View style={s.chipsRow}>
            {cats.map((c) => (
              <TouchableOpacity testID={`ob-cat-${c.key}`} key={c.key} style={[s.chip, category === c.key && s.chipActive]} onPress={() => setCategory(c.key)}>
                <Text style={[s.chipTxt, category === c.key && s.chipTxtActive]}>{c.key}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>City *</Text>
          <View style={s.chipsRow}>
            {cities.map((c) => (
              <TouchableOpacity testID={`ob-city-${c}`} key={c} style={[s.chip, city === c && s.chipActive]} onPress={() => setCity(c)}>
                <Text style={[s.chipTxt, city === c && s.chipTxtActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>About you *</Text>
          <TextInput testID="ob-bio" style={[s.input, { minHeight: 90, textAlignVertical: "top" }]} value={bio} onChangeText={setBio}
            placeholder="Years of experience, signature work, what makes you unique..." placeholderTextColor={COLORS.textTertiary} multiline />

          <Text style={s.label}>WhatsApp / Phone *</Text>
          <TextInput testID="ob-phone" style={s.input} value={phone} onChangeText={setPhone} placeholder="+919999988888" placeholderTextColor={COLORS.textTertiary} keyboardType="phone-pad" />

          <Text style={s.label}>Instagram (optional)</Text>
          <TextInput testID="ob-instagram" style={s.input} value={instagram} onChangeText={setInstagram} placeholder="@yourhandle" placeholderTextColor={COLORS.textTertiary} autoCapitalize="none" />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Min price (₹) *</Text>
              <TextInput testID="ob-min" style={s.input} value={priceMin} onChangeText={setPriceMin} placeholder="5000" placeholderTextColor={COLORS.textTertiary} keyboardType="number-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Max price (₹) *</Text>
              <TextInput testID="ob-max" style={s.input} value={priceMax} onChangeText={setPriceMax} placeholder="50000" placeholderTextColor={COLORS.textTertiary} keyboardType="number-pad" />
            </View>
          </View>

          <TouchableOpacity testID="ob-submit" style={[s.btn, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
            <Text style={s.btnTxt}>{busy ? "Creating..." : "Go Live"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  title: { fontSize: 17, fontWeight: "800", color: COLORS.text },
  intro: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  content: { padding: SPACING.lg },
  label: { fontSize: 13, fontWeight: "700", color: COLORS.textSecondary, marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: COLORS.text },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  chipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryMuted },
  chipTxt: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  chipTxtActive: { color: COLORS.primary },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.md, alignItems: "center", marginTop: 28 },
  btnTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
