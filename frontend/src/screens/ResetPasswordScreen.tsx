import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import InputField from '../components/InputField';
import Button from '../components/Button';
import apiClient from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC<Props> = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const { email } = route.params;

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
  });
  
  const pwd = watch("newPassword");

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password/reset', {
        email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      Alert.alert('Success', 'Password has been reset successfully.');
      navigation.replace('Login');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="otp"
            rules={{ required: 'OTP is required', minLength: 6, maxLength: 6 }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="6-Digit OTP"
                placeholder="123456"
                value={value}
                onChangeText={onChange}
                error={errors.otp?.message}
                keyboardType="numeric"
              />
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            rules={{ required: 'New password is required', minLength: { value: 8, message: 'At least 8 chars' } }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="New Password"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                error={errors.newPassword?.message}
                secureTextEntry
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            rules={{ required: 'Confirm password is required', validate: v => v === pwd || 'Passwords must match' }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Confirm Password"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
                secureTextEntry
              />
            )}
          />
        </View>

        <Button title="Reset Password" onPress={handleSubmit(onSubmit)} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 100 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 32 },
  form: { marginBottom: 24 },
});

export default ResetPasswordScreen;
