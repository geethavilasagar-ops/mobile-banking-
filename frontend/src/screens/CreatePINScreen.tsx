import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import PINInput from '../components/PINInput';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import apiClient from '../api/client';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreatePIN'>;
  route: RouteProp<RootStackParamList, 'CreatePIN'>;
};

const CreatePINScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const handleCreate = async () => {
    setPinError('');
    setConfirmError('');

    if (pin.length !== 4) { setPinError('Please enter a 4-digit PIN.'); return; }
    if (confirmPin.length !== 4) { setConfirmError('Please confirm your PIN.'); return; }
    if (pin !== confirmPin) { setConfirmError('PINs do not match.'); return; }

    setLoading(true);
    try {
      await apiClient.post('/pin/set', { pin, confirmPin });
      await apiClient.post('/registration/complete');
      navigation.navigate('Success');
    } catch (err: any) {
      const msg = err.message || 'Failed to set PIN.';
      if (msg.toLowerCase().includes('weak') || msg.toLowerCase().includes('simple')) {
        setPinError(msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepText}>Step 6 of 7</Text>
        <View style={{ width: 32 }} />
      </View>

      <ProgressBar current={6} total={7} />

      <Text style={styles.title}>Create Transaction PIN</Text>
      <Text style={styles.subtitle}>
        Set a secure 4-digit PIN for authorizing transactions.
      </Text>

      <View style={styles.pinNote}>
        <Text style={styles.pinNoteText}>
          ⚠️  Avoid simple PINs like 1234, 0000, or repeated digits
        </Text>
      </View>

      <View style={styles.pinSection}>
        <PINInput label="Create PIN" onComplete={setPin} error={pinError} />
        <PINInput label="Confirm PIN" onComplete={setConfirmPin} error={confirmError} />
      </View>

      <Button
        title="Create PIN"
        onPress={handleCreate}
        loading={loading}
        disabled={pin.length !== 4 || confirmPin.length !== 4}
        style={{ marginTop: 16 }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 20, color: '#374151', fontWeight: '600' },
  stepText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 8, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16, lineHeight: 22 },
  pinNote: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 28,
  },
  pinNoteText: { fontSize: 13, color: '#92400E', lineHeight: 18 },
  pinSection: { gap: 8 },
});

export default CreatePINScreen;
