// app/(guard)/search-flat.tsx

import { useAuthStore } from '@/store/use-auth';
import { supabase } from '@/utils/supabase';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type FlatResult = {
  id: string;
  flat_number: string;
  tower_name: string;
  resident_name: string | null;
  resident_phone: string | null;
};

const PURPOSES = ['delivery', 'cab', 'guest', 'service'] as const;

export default function SearchFlatScreen() {
  const { user } = useAuthStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FlatResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [selectedFlat, setSelectedFlat] = useState<FlatResult | null>(null);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [purpose, setPurpose] = useState<typeof PURPOSES[number]>('delivery');
  const [sending, setSending] = useState(false);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);

  // ---- Search flats by number or resident name ----
  async function handleSearch(text: string) {
    setQuery(text);
    if (text.trim().length < 1) {
      setResults([]);
      return;
    }

    setSearching(true);
    const { data, error } = await supabase
      .from('flats')
      .select(`
        id,
        flat_number,
        towers ( name ),
        resident_flats (
          profiles ( full_name, phone )
        )
      `)
      .ilike('flat_number', `%${text}%`)
      .limit(20);

    setSearching(false);

    if (error) {
      console.error(error);
      return;
    }

    const mapped: FlatResult[] = (data ?? []).map((f: any) => ({
      id: f.id,
      flat_number: f.flat_number,
      tower_name: f.towers?.name ?? '',
      resident_name: f.resident_flats?.[0]?.profiles?.full_name ?? null,
      resident_phone: f.resident_flats?.[0]?.profiles?.phone ?? null,
    }));

    setResults(mapped);
  }

  // ---- Send approval request to resident ----
  async function handleSendRequest() {
    if (!selectedFlat) return;
    if (!visitorName.trim()) {
      Alert.alert('Missing info', 'Enter visitor name.');
      return;
    }

    setSending(true);
    const { error } = await supabase.from('visitors').insert({
      society_id: null, // resolved server-side via flat_id if you set up a trigger, or pass explicitly if you have it in context
      flat_id: selectedFlat.id,
      name: visitorName.trim(),
      phone: visitorPhone.trim() || null,
      vehicle_number: vehicleNumber.trim() || null,
      purpose,
      requested_by_guard_id: user?.id,
      approval_status: 'pending',
    });
    setSending(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Sent', `Request sent to ${selectedFlat.flat_number}. Waiting for approval.`);
    setSelectedFlat(null);
    setVisitorName('');
    setVisitorPhone('');
    setVehicleNumber('');
    setPurpose('delivery');
  }

  // ---- Scan invite code ----
  async function handleScan({ data: code }: { data: string }) {
    if (scanning) return; // prevent double-fires
    setScanning(true);

    const { data, error } = await supabase.rpc('verify_invite_pass', {
      pass_code: code,
      guard_id: user?.id,
    });

    setScanning(false);
    setScannerOpen(false);

    if (error) {
      Alert.alert('Invalid code', error.message ?? 'This code is invalid or expired.');
      return;
    }

    Alert.alert('Entry approved', 'Visitor logged and entry recorded.');
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search flat number or resident name"
        value={query}
        onChangeText={handleSearch}
      />

      <Pressable
        style={styles.scanButton}
        onPress={async () => {
          if (!permission?.granted) {
            const res = await requestPermission();
            if (!res.granted) {
              Alert.alert('Camera permission needed', 'Enable camera access to scan invite codes.');
              return;
            }
          }
          setScannerOpen(true);
        }}
      >
        <Text style={styles.scanButtonText}>Scan Invite Code</Text>
      </Pressable>

      {searching && <ActivityIndicator style={{ marginTop: 12 }} />}

      <FlatList
        style={{ marginTop: 12 }}
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.resultCard} onPress={() => setSelectedFlat(item)}>
            <Text style={styles.flatNumber}>{item.tower_name} - {item.flat_number}</Text>
            <Text style={styles.residentName}>
              {item.resident_name ?? 'No resident linked'}
            </Text>
          </Pressable>
        )}
      />

      {/* ---- Send approval request modal ---- */}
      <Modal visible={!!selectedFlat} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Log visitor for {selectedFlat?.tower_name} - {selectedFlat?.flat_number}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Visitor name"
              value={visitorName}
              onChangeText={setVisitorName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone (optional)"
              value={visitorPhone}
              onChangeText={setVisitorPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Vehicle number (optional)"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
            />

            <View style={styles.purposeRow}>
              {PURPOSES.map((p) => (
                <Pressable
                  key={p}
                  style={[styles.purposeChip, purpose === p && styles.purposeChipSelected]}
                  onPress={() => setPurpose(p)}
                >
                  <Text style={purpose === p ? { color: '#fff' } : {}}>{p}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.sendButton} onPress={handleSendRequest} disabled={sending}>
              {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendButtonText}>Send Approval Request</Text>}
            </Pressable>

            <Pressable onPress={() => setSelectedFlat(null)} style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={{ color: '#888' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ---- QR scanner modal ---- */}
      <Modal visible={scannerOpen} animationType="slide">
        <CameraView
          style={{ flex: 1 }}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleScan}
        />
        <Pressable style={styles.closeScannerButton} onPress={() => setScannerOpen(false)}>
          <Text style={{ color: '#fff' }}>Close</Text>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  scanButton: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  scanButtonText: { color: '#fff', fontWeight: '600' },
  resultCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 8,
  },
  flatNumber: { fontSize: 15, fontWeight: '600' },
  residentName: { fontSize: 13, color: '#666', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 10 },
  purposeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  purposeChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  purposeChipSelected: { backgroundColor: '#111', borderColor: '#111' },
  sendButton: { backgroundColor: '#111', padding: 14, borderRadius: 10, alignItems: 'center' },
  sendButtonText: { color: '#fff', fontWeight: '600' },
  closeScannerButton: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#111', padding: 14, borderRadius: 30, paddingHorizontal: 24 },
});