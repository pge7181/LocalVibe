import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { api } from "../../src/api";
import { useAuth } from "../../src/auth";
import { COLORS, RADIUS, SPACING } from "../../src/theme";

type Inq = {
  id: string; provider_id: string; provider_name: string; user_name: string; user_email: string;
  event_type: string; event_date: string; budget: number; message: string; status: string; created_at: string;
};

export default function Leads() {
  const { user } = useAuth();
  const [items, setItems] = useState<Inq[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/inquiries/me");
      setItems(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const isProvider = user?.role === "provider";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={["top"]}>
      <View style={s.header}>
        <Text style={s.title}>{isProvider ? "Your Leads" : "Your Inquiries"}</Text>
        <Text style={s.subtitle}>{isProvider ? "Inquiries from interested clients" : "Quotes you've requested"}</Text>
      </View>

      {loading ? <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: SPACING.lg, gap: 12, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="mail-open-outline" size={42} color={COLORS.textTertiary} />
              <Text style={s.emptyTxt}>No {isProvider ? "leads" : "inquiries"} yet</Text>
              <Text style={s.emptyDesc}>{isProvider ? "Promote your profile to start receiving leads." : "Browse creators and request a quote."}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View testID={`lead-${item.id}`} style={s.card}>
              <View style={s.cardHead}>
                <View style={s.statusDot} />
                <Text style={s.eventType}>{item.event_type}</Text>
                <Text style={s.dateAgo}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={s.who}>{isProvider ? `From ${item.user_name}` : `To ${item.provider_name}`}</Text>
              <Text style={s.msg} numberOfLines={3}>{item.message}</Text>
              <View style={s.metaGrid}>
                <View style={s.metaItem}><Text style={s.metaLab}>Date</Text><Text style={s.metaVal}>{item.event_date}</Text></View>
                <View style={s.metaItem}><Text style={s.metaLab}>Budget</Text><Text style={s.metaVal}>₹{item.budget.toLocaleString("en-IN")}</Text></View>
              </View>
              {isProvider && (
                <TouchableOpacity testID={`lead-reply-${item.id}`} style={s.replyBtn} onPress={() => Linking.openURL(`mailto:${item.user_email}?subject=Re: Your inquiry on LocalVibe`)}>
                  <Ionicons name="mail" size={16} color="#fff" />
                  <Text style={s.replyTxt}>Reply via Email</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  empty: { alignItems: "center", padding: 60, gap: 8 },
  emptyTxt: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginTop: 8 },
  emptyDesc: { color: COLORS.textSecondary, textAlign: "center" },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: COLORS.borderLight },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  eventType: { fontSize: 15, fontWeight: "700", color: COLORS.text, flex: 1 },
  dateAgo: { fontSize: 11, color: COLORS.textTertiary },
  who: { fontSize: 13, color: COLORS.textSecondary, marginTop: 8 },
  msg: { fontSize: 14, color: COLORS.text, marginTop: 8, lineHeight: 20 },
  metaGrid: { flexDirection: "row", gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  metaItem: { flex: 1 },
  metaLab: { fontSize: 11, color: COLORS.textTertiary, textTransform: "uppercase", fontWeight: "700" },
  metaVal: { fontSize: 14, color: COLORS.text, fontWeight: "600", marginTop: 2 },
  replyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: COLORS.primary, marginTop: 12, paddingVertical: 12, borderRadius: RADIUS.md },
  replyTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
