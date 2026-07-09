import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import InputField from '../components/InputField';
import apiClient from '../api/client';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Aadhaar'>;
  route: RouteProp<RootStackParamList, 'Aadhaar'>;
};

const formatAadhaar = (text: string) => {
  const digits = text.replace(/\D/g, '').slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
};

const AadhaarScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const [aadhaar, setAadhaar] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    const digits = aadhaar.replace(/\s/g, '');
    const mobileDigits = mobileNumber.replace(/\D/g, '');
    
    if (digits.length !== 12) { setError('Please enter a valid 12-digit Aadhaar number.'); return; }
    if (mobileDigits.length !== 10) { setError('Please enter a valid 10-digit mobile number.'); return; }
    if (!consent) { setError('Please provide consent to proceed.'); return; }
    
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/aadhaar/send-otp', {
        aadhaarNumber: digits,
        mobileNumber: mobileDigits,
        consent: 'true',
      });
      navigation.navigate('AadhaarOTP', { userId });
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.stepText}>Step 4 of 7</Text>
          <View style={{ width: 32 }} />
        </View>

        <ProgressBar current={4} total={7} />

        <Text style={styles.title}>Aadhaar authentication</Text>
        <Text style={styles.subtitle}>Enter your 12-digit Aadhaar number to receive an OTP.</Text>

        <InputField
          label="Aadhaar Number"
          placeholder="1234 5678 9012"
          value={aadhaar}
          onChangeText={(text) => {
            setAadhaar(formatAadhaar(text));
            setError('');
          }}
          keyboardType="number-pad"
          maxLength={14}
          error={error && error.includes('Aadhaar') ? error : undefined}
        />

        {/* 
          Note: In a true production environment, the Aadhaar API natively sends the OTP to the
          mobile number already linked to the Aadhaar profile. However, since no public API exists 
          for developers to test this natively, we explicitly collect the user's mobile number 
          to simulate the SMS flow using a gateway like Twilio.
        */}
        <InputField
          label="Linked Mobile Number"
          placeholder="9876543210"
          value={mobileNumber}
          onChangeText={(text) => {
            setMobileNumber(text.replace(/\D/g, '').slice(0, 10));
            setError('');
          }}
          keyboardType="number-pad"
          maxLength={10}
          error={error && error.includes('mobile') ? error : undefined}
        />

        {/* Consent Checkbox */}
        <TouchableOpacity style={styles.consentRow} onPress={() => setConsent(!consent)} activeOpacity={0.7}>
          <View style={[styles.checkbox, consent && styles.checkboxChecked]}>
            {consent && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.consentText}>
            I consent to Dev Pay verifying my Aadhaar details with UIDAI for account activation.
          </Text>
        </TouchableOpacity>

        {error && !error.includes('Aadhaar') && (
          <Text style={styles.error}>{error}</Text>
        )}

        <Button title="Send OTP" onPress={handleSendOTP} loading={loading} style={{ marginTop: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 22 },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2,
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  consentText: { flex: 1, fontSize: 13, color: '#6B7280', lineHeight: 20 },
  error: { fontSize: 12, color: '#EF4444', marginTop: 8 },
});

export default AadhaarScreen;
