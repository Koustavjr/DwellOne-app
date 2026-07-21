import { useAuthStore } from '@/store/use-auth';
import { supabase } from '@/utils/supabase';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { routeAfterAuth } from '../../utils/routeAfterAuth';

export default function AuthCallback() {
    const router = useRouter();
    const [societyID, setSocietyID] = useState("");
    const { user } = useAuthStore()


    const isRegistered = async () => {
        if (!user?.id) {
            return false
        }

        const { data, error } = await supabase
            .from("profiles")
            .select("id, role")
            .eq("id", user.id)
            .single()

        if (error) {
            console.error("Error fetching profile:", error)
            return false
        }

        router.replace(`/${data.role as any}/dashboard` as any)
    }

    useEffect(() => {

        isRegistered()

    }, [user])
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.card}>
                {/* Header / Loading status */}
                <View style={styles.header}>
                    <View style={styles.spinnerWrapper}>
                        <ActivityIndicator size="large" color="#6366F1" />
                    </View>
                    <Text style={styles.title}>Redirecting...</Text>
                    <Text style={styles.subtitle}>Enter your Society ID or select a role below</Text>
                </View>

                {/* Input Section */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Enter Society ID</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. SOC-10928"
                        placeholderTextColor="#6B7280"
                        value={societyID}
                        onChangeText={setSocietyID}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <Pressable
                        style={({ pressed }) => [
                            styles.submitBtn,
                            pressed && styles.btnPressed,
                            !societyID.trim() && styles.btnDisabled,
                        ]}
                        onPress={async () => await routeAfterAuth(router, societyID)}
                    >
                        <Text style={styles.submitBtnText}>Submit</Text>
                    </Pressable>
                </View>

                {/* Divider */}
                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR QUICK SELECT</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Quick Role Options */}
                <View style={styles.roleRow}>
                    <Pressable
                        style={({ pressed }) => [styles.roleBtn, pressed && styles.btnPressed]}
                        onPress={async () => await routeAfterAuth(router, "resident")}
                    >
                        <Text style={styles.roleBtnText}>Resident</Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [styles.roleBtn, pressed && styles.btnPressed]}
                        onPress={async () => await routeAfterAuth(router, "")}
                    >
                        <Text style={styles.roleBtnText}>SKIP</Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [styles.roleBtn, pressed && styles.btnPressed]}
                        onPress={async () => await routeAfterAuth(router, "guard")}
                    >
                        <Text style={styles.roleBtnText}>Guard</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 28,
        borderWidth: 1,
        borderColor: '#334155',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
        gap: 24,
    },
    header: {
        alignItems: 'center',
        gap: 8,
    },
    spinnerWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#312E81',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    title: {
        color: '#F8FAFC',
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    subtitle: {
        color: '#94A3B8',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
    inputContainer: {
        gap: 10,
    },
    inputLabel: {
        color: '#CBD5E1',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    input: {
        backgroundColor: '#0F172A',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#F8FAFC',
        fontSize: 15,
    },
    submitBtn: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#334155',
    },
    dividerText: {
        color: '#64748B',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    roleRow: {
        flexDirection: 'row',
        gap: 12,
    },
    roleBtn: {
        flex: 1,
        backgroundColor: '#334155',
        borderWidth: 1,
        borderColor: '#475569',
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleBtnText: {
        color: '#F8FAFC',
        fontSize: 14,
        fontWeight: '600',
    },
    btnPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    btnDisabled: {
        opacity: 0.6,
    },
});
