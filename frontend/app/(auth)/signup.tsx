import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/auth";
import { COLORS, RADIUS, SPACING } from "../../src/theme";

export default function Signup() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"seeker" | "provider">("seeker");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name || !email || !password) return Alert.alert("Missing fields", "All fields are required");
    if (password.length < 6) return Alert.alert("Weak password", "Use at least 6 characters");
    setBusy(true);
    try {
      await register(email.trim(), password, name.trim(), role);
      router.replace(role === "provider" ? "/provider-onboarding" : "/(tabs)");
    } catch (e: any) {
      Alert.alert("Signup failed", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.brand}>
          <View style={s.logo}><Ionicons name="sparkles" size={28} color={COLORS.primary} /></View>
          <Text style={s.title}>Create your account</Text>
          <Text style={s.subtitle}>Find creators or get found by clients</Text>
        </View>
        <View style={s.form}>
          <Text style={s.label}>I am a</Text>
          <View style={s.roleRow}>
            <TouchableOpacity testID="role-seeker" style={[s.rolePill, role === "seeker" && s.rolePillActive]} onPress={() => setRole("seeker")}>
              <Ionicons name="search" size={18} color={role === "seeker" ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[s.roleText, role === "seeker" && s.roleTextActive]}>Looking for services</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="role-provider" style={[s.rolePill, role === "provider" && s.rolePillActive]} onPress={() => setRole("provider")}>
              <Ionicons name="briefcase" size={18} color={role === "provider" ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[s.roleText, role === "provider" && s.roleTextActive]}>Offering services</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.label}>Name</Text>
          <TextInput testID="signup-name-input" style={s.input} placeholder="Your name" placeholderTextColor={COLORS.textTertiary}
            value={name} onChangeText={setName} />
          <Text style={s.label}>Email</Text>
          <TextInput testID="signup-email-input" style={s.input} placeholder="you@example.com" placeholderTextColor={COLORS.textTertiary}
            value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Text style={s.label}>Password</Text>
          <TextInput testID="signup-password-input" style={s.input} placeholder="At least 6 characters" placeholderTextColor={COLORS.textTertiary}
            value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity testID="signup-submit-btn" style={[s.btn, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
            <Text style={s.btnText}>{busy ? "Creating..." : "Create Account"}</Text>
          </TouchableOpacity>
          <View style={s.row}>
            <Text style={s.muted}>Already have an account? </Text>
            <Link href="/login" asChild><TouchableOpacity testID="goto-login"><Text style={s.link}>Sign in</Text></TouchableOpacity></Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { padding: SPACING.xxl, paddingTop: 60, backgroundColor: COLORS.bg, flexGrow: 1 },
  brand: { alignItems: "center", marginBottom: 28 },
  logo: { width: 56, height: 56, borderRadius: 18, backgroundColor: COLORS.primaryMuted, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6, textAlign: "center" },
  form: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary, marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: COLORS.text },
  btn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: "center", marginTop: 24 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  row: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  muted: { color: COLORS.textSecondary },
  link: { color: COLORS.primary, fontWeight: "700" },
  roleRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  rolePill: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  rolePillActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryMuted },
  roleText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  roleTextActive: { color: COLORS.primary },
});
