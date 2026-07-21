// app/profile.tsx

import { useAuthStore } from '@/store/use-auth';
import { supabase } from '@/utils/supabase';
import { useForm } from '@tanstack/react-form';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { z } from 'zod';

type Role = 'resident' | 'guard' | 'admin' | any;

const validator = z.object({
  full_name: z.string().min(5),
  phone: z.string().max(10).regex(/^[6-9]\d{9}$/),
  email: z.email(),
  role: z.string().min(4),
  society_name: z.string().min(4),
})

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { resolvedRole } = useLocalSearchParams<{ resolvedRole?: string }>();

  let role: Role = (resolvedRole as Role) ?? 'admin';

  if (role !== 'resident' && role !== 'guard') {
    role = 'admin'
  }

  const form = useForm({
    defaultValues: {
      "full_name": "",
      "phone": "",
      "email": "",
      "role": role,
      "society_name": "",
    },
    validators: {
      onChange: validator,
    },
    onSubmit: async ({ value }) => {
      try {
        const { data: societyID, error: societyError } = await supabase.from('societies').select('id').eq('name', value.society_name).maybeSingle();

        if (societyError) throw societyError;
        if (!societyID) {
          console.log("Society ID not found");
          return
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Active session:', session);
        console.log('Session user id:', session?.user?.id);
        if (value.role !== 'resident' && value.role !== 'guard') {
          value.role = 'admin'
        }

        const { data: profile, error: profileError } = await supabase.from('profiles').insert({
          id: user?.id,
          full_name: value.full_name,
          phone: value.phone,
          email: user?.email,
          role: value.role,
          society_id: societyID.id,
          created_at: new Date().toISOString()
        }).select().single();
        if (profileError) throw profileError;
        console.log("Profile created successfully");
        router.replace(`/${value.role}/dashboard` as any);

      } catch (error) {
        console.log("Error in profile.tsx", error);

      }
    }
  })

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Complete Profile',
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: '#F8FAFC',
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header section */}
        <View style={styles.header}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Role: {role}</Text>
          </View>
          <Text style={styles.title}>Complete your profile</Text>
          <Text style={styles.subtitle}>Please provide your account details below to finalize your registration.</Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <form.Field name="full_name">
            {(field) => (
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  placeholder="e.g. Priya Sharma"
                  placeholderTextColor="#6B7280"
                />
                {field.state.meta.errors.length > 0 && (
                  <Text style={styles.error}>
                    {field.state.meta.errors.map(e => e?.message ?? e).join(', ')}
                  </Text>
                )}
              </View>
            )}
          </form.Field>

          <form.Field name="phone">
            {(field) => (
              <View style={styles.field}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#6B7280"
                  keyboardType="number-pad"
                  maxLength={10}
                />
                {field.state.meta.errors.length > 0 && (
                  <Text style={styles.error}>
                    {field.state.meta.errors.map(e => e?.message ?? e).join(', ')}
                  </Text>
                )}
              </View>
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <View style={styles.field}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  placeholder="name@example.com"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {field.state.meta.errors.length > 0 && (
                  <Text style={styles.error}>
                    {field.state.meta.errors.map(e => e?.message ?? e).join(', ')}
                  </Text>
                )}
              </View>
            )}
          </form.Field>

          <form.Field name="society_name">
            {(field) => (
              <View style={styles.field}>
                <Text style={styles.label}>Society Name</Text>
                <TextInput
                  style={styles.input}
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  placeholder="Registered society name"
                  placeholderTextColor="#6B7280"
                />
                {field.state.meta.errors.length > 0 && (
                  <Text style={styles.error}>
                    {field.state.meta.errors.map(e => e?.message ?? e).join(', ')}
                  </Text>
                )}
              </View>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  !canSubmit && styles.buttonDisabled,
                  pressed && canSubmit && !isSubmitting && styles.btnPressed,
                ]}
                disabled={!canSubmit}
                onPress={form.handleSubmit}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Submitting...' : 'Save & Continue'}
                </Text>
              </Pressable>
            )}
          </form.Subscribe>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    padding: 24,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#312E81',
    borderWidth: 1,
    borderColor: '#4F46E5',
    marginBottom: 12,
  },
  roleBadgeText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
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
  error: {
    color: '#F87171',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});