import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import OTPInput from '../components/OTPInput';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import apiClient from '../api/client';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AadhaarOTP'>;
  route: RouteProp<RootStackParamList, 'AadhaarOTP'>;
};

const OTP_DURATION = 120;
const RESEND_DELAY = 30;

const AadhaarOTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(OTP_DURATION);
  const [resendTimer, setResendTimer] = useState(RESEND_DELAY);
  const [error, setError] = useState('');

  useEffect(() => {
    const i = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const i = setInterval(() => setResendTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleVerify = async () => {
    if (otp.length !== 6) { setError('Please enter the 6-digit code.'); return; }
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/aadhaar/verify-otp', { otp });
      navigation.navigate('CreatePIN', { userId });
    } catch (err: any) {
      setError(err.message || 'Incorrect OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      // Would need to re-submit aadhaar number; for simplicity navigate back
      Alert.alert('Resend OTP', 'Please go back and re-enter your Aadhaar number to resend OTP.');
    } catch (err: any) {
      Alert.alert('Error', 'Failed to resend OTP.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepText}>Step 5 of 7</Text>
        <View style={{ width: 32 }} />
      </View>

      <ProgressBar current={5} total={7} />

      <Text style={styles.title}>Verify Aadhaar OTP</Text>
      <Text style={styles.subtitle}>Enter the OTP sent to your Aadhaar-registered mobile number.</Text>

      <View style={styles.otpWrapper}>
        <OTPInput onComplete={setOtp} error={error} />
      </View>

      <View style={styles.timerRow}>
        <Text style={styles.timerText}>
          {timer > 0 ? `Expires in ${formatTime(timer)}` : 'Code expired'}
        </Text>
        <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
          <Text style={[styles.resend, resendTimer > 0 && styles.resendDisabled]}>
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottom}>
        <Button title="Verify" onPress={handleVerify} loading={loading} disabled={otp.length !== 6 || timer === 0} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 20, color: '#374151', fontWeight: '600' },
  stepText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 8, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: '#6B7280', lineHeight: 22, marginBottom: 36 },
  otpWrapper: { marginBottom: 20 },
  timerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timerText: { fontSize: 13, color: '#6B7280' },
  resend: { fontSize: 13, color: '#4F46E5', fontWeight: '600' },
  resendDisabled: { color: '#9CA3AF' },
  bottom: { position: 'absolute', bottom: 48, left: 24, right: 24 },
});

export default AadhaarOTPScreen;
