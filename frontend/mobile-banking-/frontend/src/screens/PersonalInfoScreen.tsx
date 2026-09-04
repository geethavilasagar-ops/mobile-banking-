import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import InputField from '../components/InputField';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import apiClient, { setAuthToken } from '../api/client';
import { useRegistrationStore } from '../store/registrationStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PersonalInfo'>;
};

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const PersonalInfoScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { setSession, setName } = useRegistrationStore();

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const pwd = watch("password");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/register', {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        password: data.password,
      });

      const { token, userId } = response.data.data;
      setSession(token, userId, data.email);
      setName(data.firstName);
      setAuthToken(token);

      // Trigger OTP send
      await apiClient.post('/email/send-otp');

      navigation.navigate('EmailOTP', { userId, email: data.email });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.stepText}>Step 1 of 7</Text>
        </View>

        <ProgressBar current={1} total={7} />

        <Text style={styles.title}>Personal Information</Text>
        <Text style={styles.subtitle}>We'll use this to set up your account.</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="firstName"
            rules={{ required: 'First name is required', maxLength: { value: 50, message: 'Too long' } }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="First Name"
                placeholder="Jordan"
                value={value}
                onChangeText={onChange}
                error={errors.firstName?.message}
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            rules={{ required: 'Last name is required', maxLength: { value: 50, message: 'Too long' } }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Last Name"
                placeholder="Rivera"
                value={value}
                onChangeText={onChange}
                error={errors.lastName?.message}
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
            }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Email Address"
                placeholder="you@example.com"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            rules={{
              required: 'Phone number is required',
              pattern: { value: /^[0-9]{10}$/, message: 'Enter a valid 10-digit phone number' },
            }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Phone Number"
                placeholder="9876543210"
                value={value}
                onChangeText={onChange}
                error={errors.phone?.message}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' }
            }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Password"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
                secureTextEntry
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Please confirm your password',
              validate: value => value === pwd || 'Passwords do not match'
            }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Confirm Password"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
                secureTextEntry
                returnKeyType="done"
              />
            )}
          />
        </View>

        <Button
          title="Continue"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.button}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  stepText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 8, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 20 },
  form: { marginBottom: 24 },
  button: { marginTop: 8 },
});

export default PersonalInfoScreen;
