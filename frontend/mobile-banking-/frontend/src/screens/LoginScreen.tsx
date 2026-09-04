import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import InputField from '../components/InputField';
import Button from '../components/Button';
import apiClient, { setAuthToken } from '../api/client';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>; };

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      const { token } = res.data.data;
      setAuthToken(token);
      navigation.replace('Dashboard');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your Dev Pay account</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            rules={{ required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Email"
                placeholder="you@example.com"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{ required: 'Password is required' }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Password"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
                secureTextEntry
              />
            )}
          />

          <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('PersonalInfo')}>
            <Text style={styles.linkText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 32 },
  form: { marginBottom: 24 },
  forgotPassword: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 16 },
  forgotPasswordText: { color: '#4F46E5', fontWeight: '600', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#6B7280', fontSize: 14 },
  linkText: { color: '#4F46E5', fontWeight: '600', fontSize: 14 },
});

export default LoginScreen;
