import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import OTPInput from '../components/OTPInput';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import apiClient from '../api/client';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EmailOTP'>;
  route: RouteProp<RootStackParamList, 'EmailOTP'>;
};

const OTP_DURATION = 120; // 2 minutes
const RESEND_DELAY = 30;

const EmailOTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId, email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(OTP_DURATION);
  const [resendTimer, setResendTimer] = useState(RESEND_DELAY);
  const [error, setError] = useState('');

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Resend cooldown
  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleVerify = async () => {
    if (otp.length !== 6) { setError('Please enter the 6-digit code.'); return; }
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/email/verify-otp', { otp });
      navigation.navigate('SelectBank', { userId });
    } catch (err: any) {
      setError(err.message || 'Incorrect OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResending(true);
    try {
      await apiClient.post('/email/send-otp');
      setTimer(OTP_DURATION);
      setResendTimer(RESEND_DELAY);
      setError('');
      Alert.alert('OTP Sent', 'A new verification code has been sent to your email.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepText}>Step 2 of 7</Text>
        <View style={{ width: 32 }} />
      </View>

      <ProgressBar current={2} total={7} />

      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to{'\n'}
        <Text style={styles.email}>{email}</Text>
      </Text>

      <View style={styles.otpWrapper}>
        <OTPInput onComplete={setOtp} error={error} />
      </View>

      <View style={styles.timerRow}>
        <Text style={styles.timerText}>
          {timer > 0 ? `Expires in ${formatTime(timer)}` : 'Code expired'}
        </Text>
        <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0 || resending}>
          <Text style={[styles.resend, resendTimer > 0 && styles.resendDisabled]}>
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottom}>
        <Button
          title="Verify"
          onPress={handleVerify}
          loading={loading}
          disabled={otp.length !== 6 || timer === 0}
        />
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
  email: { color: '#4F46E5', fontWeight: '600' },
  otpWrapper: { marginBottom: 20 },
  timerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  timerText: { fontSize: 13, color: '#6B7280' },
  resend: { fontSize: 13, color: '#4F46E5', fontWeight: '600' },
  resendDisabled: { color: '#9CA3AF' },
  bottom: { position: 'absolute', bottom: 48, left: 24, right: 24 },
});

export default EmailOTPScreen;
