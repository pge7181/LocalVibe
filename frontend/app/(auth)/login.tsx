import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/auth";
import { COLORS, RADIUS, SPACING } from "../../src/theme";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("demo@localvibe.app");
  const [password, setPassword] = useState("Demo@12345");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password) return Alert.alert("Missing fields", "Email and password are required");
    setBusy(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Login failed", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.brand}>
          <View style={s.logo}><Ionicons name="sparkles" size={28} color={COLORS.primary} /></View>
          <Text style={s.title}>LocalVibe</Text>
          <Text style={s.subtitle}>Discover talented local creators for every celebration</Text>
        </View>
        <View style={s.form}>
          <Text style={s.label}>Email</Text>
          <TextInput testID="login-email-input" style={s.input} placeholder="you@example.com" placeholderTextColor={COLORS.textTertiary}
            value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Text style={s.label}>Password</Text>
          <TextInput testID="login-password-input" style={s.input} placeholder="••••••••" placeholderTextColor={COLORS.textTertiary}
            value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity testID="login-submit-btn" style={[s.btn, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
            <Text style={s.btnText}>{busy ? "Signing in..." : "Sign In"}</Text>
          </TouchableOpacity>
          <View style={s.row}>
            <Text style={s.muted}>New here? </Text>
            <Link href="/signup" asChild><TouchableOpacity testID="goto-signup"><Text style={s.link}>Create an account</Text></TouchableOpacity></Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { padding: SPACING.xxl, paddingTop: 80, backgroundColor: COLORS.bg, flexGrow: 1 },
  brand: { alignItems: "center", marginBottom: 48 },
  logo: { width: 64, height: 64, borderRadius: 20, backgroundColor: COLORS.primaryMuted, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 32, fontWeight: "800", color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 8, textAlign: "center", paddingHorizontal: 24 },
  form: { gap: 8 },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary, marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: COLORS.text },
  btn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: "center", marginTop: 24 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  row: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  muted: { color: COLORS.textSecondary },
  link: { color: COLORS.primary, fontWeight: "700" },
});
