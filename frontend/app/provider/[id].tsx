import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Linking, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../src/api";
import { useAuth } from "../../src/auth";
import { COLORS, RADIUS, SPACING, SHADOW } from "../../src/theme";

type Service = { title: string; description: string; price: number; unit: string };
type Review = { id: string; user_name: string; rating: number; comment: string; created_at: string };
type Provider = {
  id: string; name: string; category: string; cities: string[]; bio: string; cover: string; avatar: string;
  phone: string; whatsapp: string; instagram?: string; portfolio: string[]; services: Service[];
  rating: number; review_count: number; verified: boolean; price_min: number; price_max: number;
  reviews: Review[];
};

export default function ProviderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [p, setP] = useState<Provider | null>(null);
  const [tab, setTab] = useState<"portfolio" | "services" | "reviews">("portfolio");

  useEffect(() => {
    if (!id) return;
    api.get(`/providers/${id}`).then((r) => setP(r.data)).catch(() => Alert.alert("Error", "Could not load profile"));
  }, [id]);

  if (!p) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator color={COLORS.primary} /></View>;

  const callWhatsapp = () => {
    const num = p.whatsapp.replace(/[^0-9]/g, "");
    Linking.openURL(`https://wa.me/${num}?text=${encodeURIComponent(`Hi ${p.name}, I found you on LocalVibe and would like to know more about your services.`)}`);
  };
  const callPhone = () => Linking.openURL(`tel:${p.phone}`);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View>
          <Image source={{ uri: p.cover }} style={s.cover} />
          <TouchableOpacity testID="back-btn" style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={s.header}>
          <Image source={{ uri: p.avatar }} style={s.avatar} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.name}>{p.name}</Text>
              {p.verified && <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />}
            </View>
            <Text style={s.cat}>{p.category}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
              {p.cities.map((c) => (
                <View key={c} style={s.cityChip}>
                  <Ionicons name="location" size={11} color={COLORS.primary} />
                  <Text style={s.cityChipTxt}>{c}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
              <Ionicons name="star" size={14} color={COLORS.star} />
              <Text style={s.rating}>{p.rating.toFixed(1)}</Text>
              <Text style={s.reviewCount}>({p.review_count} reviews)</Text>
            </View>
          </View>
        </View>

        <Text style={s.bio}>{p.bio}</Text>

        <View style={s.priceCard}>
          <View><Text style={s.priceLabel}>Starts at</Text><Text style={s.priceVal}>₹{p.price_min.toLocaleString("en-IN")}</Text></View>
          <View style={s.divider} />
          <View><Text style={s.priceLabel}>Up to</Text><Text style={s.priceVal}>₹{p.price_max.toLocaleString("en-IN")}</Text></View>
          {p.instagram && (
            <TouchableOpacity testID="ig-link" style={{ marginLeft: "auto" }} onPress={() => Linking.openURL(`https://instagram.com/${p.instagram?.replace(/^@/, "")}`)}>
              <Ionicons name="logo-instagram" size={26} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={s.tabs}>
          {(["portfolio", "services", "reviews"] as const).map((t) => (
            <TouchableOpacity testID={`tab-${t}`} key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
              <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === "portfolio" && (
          <View>
            <View style={s.igHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="logo-instagram" size={18} color={COLORS.primary} />
                <Text style={s.igHeaderTxt}>Latest from Instagram</Text>
              </View>
              {p.instagram && (
                <TouchableOpacity testID="ig-handle-link" onPress={() => Linking.openURL(`https://instagram.com/${p.instagram?.replace(/^@/, "")}`)}>
                  <Text style={s.igHandle}>{p.instagram}</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={s.gallery}>
              {p.portfolio.map((url, i) => (
                <TouchableOpacity
                  key={i}
                  testID={`portfolio-img-${i}`}
                  onPress={() => p.instagram && Linking.openURL(`https://instagram.com/${p.instagram.replace(/^@/, "")}`)}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: url }} style={s.galleryImg} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {tab === "services" && (
          <View style={{ paddingHorizontal: SPACING.lg, gap: 10 }}>
            {p.services.map((sv, i) => (
              <View key={i} style={s.svCard}>
                <View style={{ flex: 1 }}>
                  <Text style={s.svTitle}>{sv.title}</Text>
                  <Text style={s.svDesc} numberOfLines={2}>{sv.description}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={s.svPrice}>₹{sv.price.toLocaleString("en-IN")}</Text>
                  <Text style={s.svUnit}>{sv.unit}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {tab === "reviews" && (
          <View style={{ paddingHorizontal: SPACING.lg, gap: 10 }}>
            {p.reviews.length === 0 ? (
              <Text style={s.empty}>No reviews yet — be the first to review.</Text>
            ) : (
              p.reviews.map((r) => (
                <View key={r.id} style={s.reviewCard}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={s.reviewer}>{r.user_name}</Text>
                    <View style={s.starRow}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Ionicons key={i} name={i < r.rating ? "star" : "star-outline"} size={12} color={COLORS.star} />
                      ))}
                    </View>
                  </View>
                  <Text style={s.reviewText}>{r.comment}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Sticky CTA */}
      <View style={s.cta}>
        <TouchableOpacity testID="call-btn" style={s.callBtn} onPress={callPhone}>
          <Ionicons name="call" size={18} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity testID="wa-btn" style={s.waBtn} onPress={callWhatsapp}>
          <Ionicons name="logo-whatsapp" size={18} color="#fff" />
          <Text style={s.waTxt}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="inquiry-btn" style={s.quoteBtn} onPress={() => {
          if (!user) return router.push("/login");
          router.push(`/inquiry/${p.id}`);
        }}>
          <Ionicons name="paper-plane" size={16} color="#fff" />
          <Text style={s.quoteTxt}>Get Quote</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  cover: { width: "100%", height: 220, backgroundColor: COLORS.borderLight },
  backBtn: { position: "absolute", top: 16, left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", gap: 14, paddingHorizontal: SPACING.lg, marginTop: -36, alignItems: "flex-end" },
  avatar: { width: 80, height: 80, borderRadius: 24, borderWidth: 3, borderColor: "#fff", backgroundColor: COLORS.borderLight },
  name: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  cat: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  cityChip: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: COLORS.primaryMuted, borderRadius: RADIUS.pill },
  cityChipTxt: { fontSize: 11, fontWeight: "700", color: COLORS.primary },
  rating: { fontSize: 13, fontWeight: "700", color: COLORS.text },
  reviewCount: { fontSize: 12, color: COLORS.textSecondary },
  bio: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21, paddingHorizontal: SPACING.lg, marginTop: 14 },
  priceCard: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg, marginTop: 16, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight },
  divider: { width: 1, height: 28, backgroundColor: COLORS.border },
  priceLabel: { fontSize: 11, color: COLORS.textTertiary, fontWeight: "700", textTransform: "uppercase" },
  priceVal: { fontSize: 16, fontWeight: "800", color: COLORS.text, marginTop: 2 },
  tabs: { flexDirection: "row", gap: 6, paddingHorizontal: SPACING.lg, marginTop: 18 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight, alignItems: "center" },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabTxt: { fontSize: 13, fontWeight: "700", color: COLORS.textSecondary },
  tabTxtActive: { color: "#fff" },
  gallery: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingHorizontal: SPACING.lg, marginTop: 4 },
  galleryImg: { width: "32%", aspectRatio: 1, borderRadius: RADIUS.md, backgroundColor: COLORS.borderLight },
  igHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, marginTop: 16, marginBottom: 12 },
  igHeaderTxt: { fontSize: 14, fontWeight: "800", color: COLORS.text },
  igHandle: { fontSize: 13, fontWeight: "700", color: COLORS.primary },
  svCard: { flexDirection: "row", gap: 12, padding: 14, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight, marginTop: 14 },
  svTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  svDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  svPrice: { fontSize: 16, fontWeight: "800", color: COLORS.primary },
  svUnit: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  empty: { paddingVertical: 30, textAlign: "center", color: COLORS.textSecondary },
  reviewCard: { backgroundColor: COLORS.surface, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight, marginTop: 10 },
  reviewer: { fontSize: 14, fontWeight: "700", color: COLORS.text, flex: 1 },
  starRow: { flexDirection: "row", gap: 1 },
  reviewText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6, lineHeight: 18 },
  cta: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", gap: 8, padding: SPACING.lg, paddingBottom: 18, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.borderLight, ...SHADOW.bar },
  callBtn: { width: 48, height: 48, borderRadius: RADIUS.md, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, justifyContent: "center", alignItems: "center" },
  waBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: COLORS.whatsapp, paddingVertical: 14, borderRadius: RADIUS.md },
  waTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  quoteBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: RADIUS.md },
  quoteTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
