import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import InputField from '../components/InputField';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import apiClient from '../api/client';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LinkCard'>;
  route: RouteProp<RootStackParamList, 'LinkCard'>;
};

interface FormData {
  accountNumber: string;
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

const formatCardNumber = (text: string) => {
  const digits = text.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (text: string) => {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

const LinkCardScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId, bankId } = route.params;
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const cardNumberClean = data.cardNumber.replace(/\s/g, '');
      await apiClient.post('/card/validate', {
        accountNumber: data.accountNumber,
        cardholderName: data.cardholderName,
        cardNumber: cardNumberClean,
        expiryDate: data.expiryDate,
        cvv: data.cvv,
      });
      await apiClient.post('/card/send-otp');
      navigation.navigate('CardOTP', { userId });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Card validation failed.');
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

        <Text style={styles.title}>Link your card</Text>
        <Text style={styles.subtitle}>Enter your debit card details securely.</Text>

        {/* Card Visual */}
        <View style={styles.cardVisual}>
          <View style={styles.cardTop}>
            <Text style={styles.cardDetailsLabel}>CARD DETAILS</Text>
            <Text style={styles.cardBrand}>🔴</Text>
          </View>
          <Text style={styles.cardNumber}>•••• •••• •••• ••••</Text>
          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.cardFieldLabel}>Cardholder</Text>
              <Text style={styles.cardFieldValue}>YOUR NAME</Text>
            </View>
            <View>
              <Text style={styles.cardFieldLabel}>Expires</Text>
              <Text style={styles.cardFieldValue}>MM/YY</Text>
            </View>
            <View>
              <Text style={styles.cardFieldLabel}>CVV</Text>
              <Text style={styles.cardFieldValue}>•••</Text>
            </View>
          </View>
        </View>

        <Controller
          control={control}
          name="cardholderName"
          rules={{ required: 'Cardholder name is required' }}
          render={({ field: { onChange, value } }) => (
            <InputField label="Cardholder Name" placeholder="Full name on card" value={value} onChangeText={onChange} error={errors.cardholderName?.message} autoCapitalize="words" />
          )}
        />

        <Controller
          control={control}
          name="cardNumber"
          rules={{ required: 'Card number required', validate: (v) => v.replace(/\s/g, '').length === 16 || '16-digit card number required' }}
          render={({ field: { onChange, value } }) => (
            <InputField label="Card Number" placeholder="1234 5678 9012 3456" value={value} onChangeText={(t) => onChange(formatCardNumber(t))} error={errors.cardNumber?.message} keyboardType="number-pad" maxLength={19} />
          )}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Controller
              control={control}
              name="expiryDate"
              rules={{ required: 'Required', pattern: { value: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'MM/YY format' } }}
              render={({ field: { onChange, value } }) => (
                <InputField label="Expiry (MM/YY)" placeholder="MM/YY" value={value} onChangeText={(t) => onChange(formatExpiry(t))} error={errors.expiryDate?.message} keyboardType="number-pad" maxLength={5} />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="cvv"
              rules={{ required: 'Required', pattern: { value: /^\d{3}$/, message: '3 digits' } }}
              render={({ field: { onChange, value } }) => (
                <InputField label="CVV" placeholder="123" value={value} onChangeText={onChange} error={errors.cvv?.message} keyboardType="number-pad" maxLength={3} secureTextEntry />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="accountNumber"
          rules={{ required: 'Account number is required' }}
          render={({ field: { onChange, value } }) => (
            <InputField label="Account Number" placeholder="Enter account number" value={value} onChangeText={onChange} error={errors.accountNumber?.message} keyboardType="number-pad" />
          )}
        />

        <Button title="Verify Card" onPress={handleSubmit(onSubmit)} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 20, color: '#374151', fontWeight: '600' },
  stepText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 6, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  cardVisual: {
    backgroundColor: '#4F46E5',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    minHeight: 140,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  cardDetailsLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, fontWeight: '600' },
  cardBrand: { fontSize: 20 },
  cardNumber: { fontSize: 18, color: 'rgba(255,255,255,0.9)', letterSpacing: 4, fontWeight: '600', marginBottom: 16 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardFieldLabel: { fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5, marginBottom: 2 },
  cardFieldValue: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  row: { flexDirection: 'row' },
});

export default LinkCardScreen;
