import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, formatErr } from "../../src/api";
import { COLORS, RADIUS, SPACING } from "../../src/theme";

const EVENT_TYPES = ["Wedding", "Engagement", "Birthday", "Anniversary", "Corporate", "Other"];

export default function Inquiry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [eventType, setEventType] = useState("Wedding");
  const [eventDate, setEventDate] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!eventDate || !budget || !message) return Alert.alert("Missing fields", "Please fill all fields");
    if (isNaN(Number(budget))) return Alert.alert("Invalid budget", "Budget must be a number");
    setBusy(true);
    try {
      await api.post("/inquiries", {
        provider_id: id,
        event_type: eventType,
        event_date: eventDate,
        budget: Number(budget),
        message,
      });
      Alert.alert("Inquiry sent! ✨", "The creator will reach out to you soon.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Failed to send", formatErr(e));
    } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={s.header}>
          <TouchableOpacity testID="inquiry-close" onPress={() => router.back()}><Ionicons name="close" size={26} color={COLORS.text} /></TouchableOpacity>
          <Text style={s.title}>Request a Quote</Text>
          <View style={{ width: 26 }} />
        </View>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Text style={s.label}>Event type</Text>
          <View style={s.chipsRow}>
            {EVENT_TYPES.map((t) => (
              <TouchableOpacity testID={`event-${t}`} key={t} style={[s.chip, eventType === t && s.chipActive]} onPress={() => setEventType(t)}>
                <Text style={[s.chipTxt, eventType === t && s.chipTxtActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Event date</Text>
          <TextInput testID="inq-date" style={s.input} placeholder="e.g. 12 Dec 2026" placeholderTextColor={COLORS.textTertiary}
            value={eventDate} onChangeText={setEventDate} />

          <Text style={s.label}>Budget (₹)</Text>
          <TextInput testID="inq-budget" style={s.input} placeholder="50000" placeholderTextColor={COLORS.textTertiary}
            value={budget} onChangeText={setBudget} keyboardType="number-pad" />

          <Text style={s.label}>Tell them about your event</Text>
          <TextInput testID="inq-message" style={[s.input, { minHeight: 110, textAlignVertical: "top" }]}
            placeholder="Share guest count, venue, theme, must-haves..." placeholderTextColor={COLORS.textTertiary}
            value={message} onChangeText={setMessage} multiline />

          <TouchableOpacity testID="inq-submit" style={[s.btn, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
            <Ionicons name="paper-plane" size={16} color="#fff" />
            <Text style={s.btnTxt}>{busy ? "Sending..." : "Send Inquiry"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  title: { fontSize: 17, fontWeight: "800", color: COLORS.text },
  content: { padding: SPACING.lg, gap: 4 },
  label: { fontSize: 13, fontWeight: "700", color: COLORS.textSecondary, marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: COLORS.text },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  chipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryMuted },
  chipTxt: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  chipTxtActive: { color: COLORS.primary },
  btn: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.md, marginTop: 28 },
  btnTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
