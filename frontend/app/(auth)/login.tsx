import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/auth";
import { saveRememberedLogin, getRememberedLogin, clearRememberedLogin } from "../../src/api";
import { COLORS, RADIUS, SPACING } from "../../src/theme";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  // Load remembered creds on first mount (only if no email was passed via params)
  useEffect(() => {
    if (params.email) return;
    (async () => {
      const saved = await getRememberedLogin();
      if (saved) {
        setEmail(saved.email);
        setPassword(saved.password);
        setRemember(true);
      }
    })();
  }, [params.email]);

  const submit = async () => {
    if (!email || !password) return Alert.alert("Missing fields", "Email and password are required");
    setBusy(true);
    try {
      await login(email.trim(), password);
      if (remember) {
        await saveRememberedLogin({ email: email.trim(), password });
      } else {
        await clearRememberedLogin();
      }
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

          <TouchableOpacity testID="remember-me-toggle" style={s.rememberRow} onPress={() => setRemember(!remember)}>
            <View style={[s.checkbox, remember && s.checkboxOn]}>
              {remember && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={s.rememberTxt}>Save my login info on this device</Text>
          </TouchableOpacity>

          <TouchableOpacity testID="login-submit-btn" style={[s.btn, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
            <Text style={s.btnText}>{busy ? "Signing in..." : "Sign In"}</Text>
          </TouchableOpacity>
          <View style={s.row}>
            <Text style={s.muted}>New here? </Text>
            <TouchableOpacity testID="goto-signup" onPress={() => router.push("/signup")}>
              <Text style={s.link}>Create an account</Text>
            </TouchableOpacity>
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
  rememberRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: COLORS.border, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.surface },
  checkboxOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  rememberTxt: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "500" },
  btn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: "center", marginTop: 18 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  row: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  muted: { color: COLORS.textSecondary },
  link: { color: COLORS.primary, fontWeight: "700" },
});
