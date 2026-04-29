import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth";
import { COLORS, RADIUS, SPACING } from "../../src/theme";

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const items = [
    { icon: "person-circle-outline", label: "Account details", onPress: () => Alert.alert("Coming soon", "Account editing in next release") },
    user?.role === "provider" && !user.provider_id
      ? { icon: "rocket-outline", label: "Set up your provider profile", onPress: () => router.push("/provider-onboarding"), highlight: true }
      : null,
    user?.role === "provider" && user.provider_id
      ? { icon: "logo-instagram", label: "Connect Instagram", onPress: () => router.push("/instagram-connect") }
      : null,
    user?.role === "provider" && user.provider_id
      ? { icon: "images-outline", label: "Manage portfolio", onPress: () => router.push("/manage-portfolio"), highlight: true }
      : null,
    user?.role === "provider" && user.provider_id
      ? { icon: "storefront-outline", label: "View public profile", onPress: () => router.push(`/provider/${user.provider_id}`) }
      : null,
    { icon: "shield-checkmark-outline", label: "Privacy & safety", onPress: () => Alert.alert("Privacy", "Reviews are moderated. Contact info is shared only after inquiry.") },
    { icon: "help-circle-outline", label: "Help & support", onPress: () => Alert.alert("Support", "Reach us at hello@localvibe.app") },
  ].filter(Boolean) as { icon: any; label: string; onPress: () => void; highlight?: boolean }[];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 40 }}>
        <View style={s.userCard}>
          <View style={s.avatar}><Text style={s.initial}>{user?.name?.[0]?.toUpperCase() || "?"}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{user?.name}</Text>
            <Text style={s.email}>{user?.email}</Text>
            <View style={s.roleTag}><Text style={s.roleTxt}>{user?.role === "provider" ? "Service Provider" : "Seeker"}</Text></View>
          </View>
        </View>

        <View style={s.section}>
          {items.map((it, idx) => (
            <TouchableOpacity testID={`profile-item-${idx}`} key={idx} style={[s.row, it.highlight && s.rowHighlight]} onPress={it.onPress}>
              <Ionicons name={it.icon} size={22} color={it.highlight ? COLORS.primary : COLORS.text} />
              <Text style={[s.rowTxt, it.highlight && { color: COLORS.primary, fontWeight: "700" }]}>{it.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity testID="logout-btn" style={s.logout} onPress={async () => { await logout(); router.replace("/login"); }}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
          <Text style={s.logoutTxt}>Sign out</Text>
        </TouchableOpacity>

        <Text style={s.version}>LocalVibe • v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  userCard: { flexDirection: "row", gap: 14, padding: 16, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, alignItems: "center" },
  avatar: { width: 64, height: 64, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center" },
  initial: { color: "#fff", fontSize: 26, fontWeight: "800" },
  name: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  email: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  roleTag: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: COLORS.primaryMuted, borderRadius: RADIUS.pill },
  roleTxt: { fontSize: 11, fontWeight: "700", color: COLORS.primary },
  section: { marginTop: 22, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  rowHighlight: { backgroundColor: COLORS.primaryMuted },
  rowTxt: { flex: 1, fontSize: 15, color: COLORS.text },
  logout: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24, paddingVertical: 14, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.primary, backgroundColor: COLORS.surface },
  logoutTxt: { fontWeight: "700", color: COLORS.primary, fontSize: 15 },
  version: { textAlign: "center", marginTop: 24, color: COLORS.textTertiary, fontSize: 12 },
});
