import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import InputField from '../components/InputField';
import Button from '../components/Button';
import apiClient from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'SendMoney'>;

const SendMoneyScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { amount: '', title: '', receiverAccountNumber: '', pin: '' },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await apiClient.post('/transactions/transfer', {
        amount: parseFloat(data.amount),
        title: data.title.trim(),
        receiverAccountNumber: data.receiverAccountNumber.trim(),
        pin: data.pin,
      });

      Alert.alert('Transfer Successful', 'Money has been sent securely.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Transfer Failed', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Send Money</Text>
        <Text style={styles.subtitle}>Fast, secure, and instant.</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="receiverAccountNumber"
            rules={{ required: 'Account Number is required' }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Receiver Account Number"
                placeholder="0000 0000 0000"
                value={value}
                onChangeText={onChange}
                error={errors.receiverAccountNumber?.message}
                keyboardType="numeric"
              />
            )}
          />

          <Controller
            control={control}
            name="amount"
            rules={{ required: 'Amount is required', min: { value: 1, message: 'Minimum ₹1' } }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Amount (₹)"
                placeholder="1000"
                value={value}
                onChangeText={onChange}
                error={errors.amount?.message}
                keyboardType="numeric"
              />
            )}
          />

          <Controller
            control={control}
            name="title"
            rules={{ required: 'Title is required' }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="What's this for?"
                placeholder="e.g. Dinner split"
                value={value}
                onChangeText={onChange}
                error={errors.title?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="pin"
            rules={{ required: 'Transaction PIN is required', minLength: 4, maxLength: 4 }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="4-Digit Transaction PIN"
                placeholder="••••"
                value={value}
                onChangeText={onChange}
                error={errors.pin?.message}
                keyboardType="numeric"
                secureTextEntry
              />
            )}
          />
        </View>

        <Button title="Transfer Now" onPress={handleSubmit(onSubmit)} loading={loading} />
        <Button title="Cancel" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} variant="ghost" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 32 },
  form: { marginBottom: 24 },
});

export default SendMoneyScreen;
