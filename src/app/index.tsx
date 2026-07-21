import { useAuthStore } from "@/store/use-auth";
import { useGoogleSignIn } from "@/utils/auth";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const { signInWithGoogle } = useGoogleSignIn();
  const { signOut, user } = useAuthStore();
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Brand / Hero Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>DwellOne</Text>
          </View>
          <Text style={styles.title}>Welcome to DwellOne</Text>
          <Text style={styles.subtitle}>
            Your all-in-one platform for modern residential society management.
          </Text>
        </View>

        {/* Action Card */}
        <View style={styles.card}>
          {user?.id ? (
            <View style={styles.actionGroup}>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active Session Detected</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
                onPress={() => router.push("/auth-callback")}
              >
                <Text style={styles.primaryBtnText}>Continue to Dashboard &rarr;</Text>
              </Pressable>
              {signOut && (
                <Pressable
                  style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
                  onPress={() => signOut()}
                >
                  <Text style={styles.secondaryBtnText}>Sign Out</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.actionGroup}>
              <Text style={styles.cardTitle}>Start your journey by signing in</Text>
              <Text style={styles.cardSubtitle}>
                Access resident tools, visitor approvals, and society notices in one place.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
                onPress={async () => await signInWithGoogle()}
              >
                <Text style={styles.primaryBtnText}>Sign In with Google</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    maxWidth: 420,
    gap: 32,
  },
  header: {
    alignItems: "center",
    textAlign: "center",
    gap: 12,
  },
  logoBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#312E81",
    borderWidth: 1,
    borderColor: "#4F46E5",
    marginBottom: 4,
  },
  logoBadgeText: {
    color: "#818CF8",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#F8FAFC",
    textAlign: "center",
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  actionGroup: {
    gap: 16,
    alignItems: "stretch",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F8FAFC",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 12,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  statusText: {
    color: "#4ADE80",
    fontSize: 12,
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: "#4F46E5",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "#334155",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#475569",
  },
  secondaryBtnText: {
    color: "#CBD5E1",
    fontSize: 14,
    fontWeight: "600",
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
