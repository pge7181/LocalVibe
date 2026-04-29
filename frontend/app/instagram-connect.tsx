import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { api, getToken, formatErr } from "../src/api";
import { useAuth } from "../src/auth";
import { COLORS, RADIUS, SPACING } from "../src/theme";

const BACKEND = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function InstagramConnect() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [provider, setProvider] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    if (!user?.provider_id) { setLoading(false); return; }
    try {
      const { data } = await api.get(`/providers/${user.provider_id}`);
      setProvider(data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchMe(); }, [user?.provider_id]);

  const connect = async () => {
    if (!user?.provider_id) {
      return Alert.alert("Profile required", "Create your provider profile before connecting Instagram.");
    }
    setBusy(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      const startUrl = `${BACKEND}/api/instagram/start?token=${encodeURIComponent(token)}`;
      const returnUrl = Linking.createURL("instagram-connected");
      const result = await WebBrowser.openAuthSessionAsync(startUrl, returnUrl);
      if (result.type === "success" || result.type === "dismiss") {
        // Re-fetch profile to see if connection succeeded
        await new Promise((r) => setTimeout(r, 600));
        await fetchMe();
        await refresh();
      }
    } catch (e: any) {
      Alert.alert("Connection error", e.message || "Try again");
    } finally { setBusy(false); }
  };

  const sync = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/instagram/sync");
      Alert.alert("Synced", `Refreshed ${data.count} photos from Instagram.`);
      await fetchMe();
    } catch (e: any) {
      Alert.alert("Sync failed", formatErr(e));
    } finally { setBusy(false); }
  };

  const disconnect = () =>
    Alert.alert("Disconnect Instagram?", "Your portfolio photos will remain but won't sync any more.", [
      { text: "Cancel", style: "cancel" },
      { text: "Disconnect", style: "destructive", onPress: async () => {
        setBusy(true);
        try {
          await api.post("/instagram/disconnect");
          await fetchMe();
        } catch (e: any) { Alert.alert("Failed", formatErr(e)); }
        finally { setBusy(false); }
      }},
    ]);

  if (loading) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator color={COLORS.primary} /></View>;

  const connected = !!provider?.ig_connected;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={s.header}>
        <TouchableOpacity testID="ig-back" onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={COLORS.text} /></TouchableOpacity>
        <Text style={s.title}>Instagram</Text>
        <View style={{ width: 22 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: SPACING.lg }}>
        <View style={s.hero}>
          <View style={s.iconWrap}><Ionicons name="logo-instagram" size={42} color={COLORS.primary} /></View>
          <Text style={s.heroTitle}>{connected ? `Connected as @${provider.ig_username}` : "Connect your Instagram"}</Text>
          <Text style={s.heroSub}>
            {connected
              ? "Your last 6 IG posts auto-fill your portfolio. You can sync anytime to pull the latest."
              : "We'll auto-pull your latest 6 posts into your portfolio. Requires a Business or Creator IG account."}
          </Text>
        </View>

        {!connected ? (
          <>
            <TouchableOpacity testID="ig-connect-btn" style={[s.btn, busy && { opacity: 0.6 }]} onPress={connect} disabled={busy}>
              <Ionicons name="logo-instagram" size={18} color="#fff" />
              <Text style={s.btnTxt}>{busy ? "Opening..." : "Connect Instagram"}</Text>
            </TouchableOpacity>
            <View style={s.notice}>
              <Ionicons name="information-circle" size={16} color={COLORS.textSecondary} />
              <Text style={s.noticeTxt}>
                Personal Instagram accounts won't work. In your IG app: Settings → Account → Switch to Professional account (free).
              </Text>
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity testID="ig-sync-btn" style={[s.btn, busy && { opacity: 0.6 }]} onPress={sync} disabled={busy}>
              <Ionicons name="sync" size={18} color="#fff" />
              <Text style={s.btnTxt}>{busy ? "Syncing..." : "Sync latest 6 posts"}</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="ig-disconnect-btn" style={s.btnGhost} onPress={disconnect} disabled={busy}>
              <Text style={s.btnGhostTxt}>Disconnect Instagram</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  title: { fontSize: 17, fontWeight: "800", color: COLORS.text },
  hero: { alignItems: "center", padding: 24, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, marginBottom: 16 },
  iconWrap: { width: 72, height: 72, borderRadius: 22, backgroundColor: COLORS.primaryMuted, justifyContent: "center", alignItems: "center", marginBottom: 14 },
  heroTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text, textAlign: "center" },
  heroSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8, textAlign: "center", lineHeight: 20 },
  btn: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.md, marginTop: 8 },
  btnTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
  btnGhost: { paddingVertical: 14, alignItems: "center", marginTop: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  btnGhostTxt: { color: COLORS.text, fontWeight: "700", fontSize: 14 },
  notice: { flexDirection: "row", gap: 8, padding: 14, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.borderLight, marginTop: 16 },
  noticeTxt: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
});
