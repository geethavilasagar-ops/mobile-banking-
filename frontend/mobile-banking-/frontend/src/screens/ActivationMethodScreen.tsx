import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import apiClient from '../api/client';
import { useRegistrationStore } from '../store/registrationStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ActivationMethod'>;
  route: RouteProp<RootStackParamList, 'ActivationMethod'>;
};

type Method = 'debit_card' | 'aadhaar';

const ActivationMethodScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId, bankId, bankName } = route.params;
  const [selected, setSelected] = useState<Method | null>(null);
  const [loading, setLoading] = useState(false);
  const { setActivationMethod } = useRegistrationStore();

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await apiClient.post('/activation/method', { bankId, method: selected });
      setActivationMethod(selected);

      if (selected === 'debit_card') {
        navigation.navigate('LinkCard', { userId, bankId });
      } else {
        navigation.navigate('Aadhaar', { userId });
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save activation method.');
    } finally {
      setLoading(false);
    }
  };

  const OptionCard = ({ method, icon, title, description }: {
    method: Method; icon: string; title: string; description: string;
  }) => {
    const isSelected = selected === method;
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => setSelected(method)}
        activeOpacity={0.8}
      >
        <View style={[styles.cardIcon, isSelected && styles.cardIconSelected]}>
          <Text style={styles.cardIconText}>{icon}</Text>
        </View>
        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>{title}</Text>
          <Text style={styles.cardDesc}>{description}</Text>
        </View>
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepText}>Step 4 of 7</Text>
        <View style={{ width: 32 }} />
      </View>

      <ProgressBar current={4} total={7} />

      <Text style={styles.title}>Choose activation{'\n'}method</Text>
      <Text style={styles.subtitle}>Select how you'd like to activate your account.</Text>

      <View style={styles.options}>
        <OptionCard
          method="debit_card"
          icon="💳"
          title="Debit Card"
          description="Activate using your linked bank debit card."
        />
        <OptionCard
          method="aadhaar"
          icon="🛡️"
          title="Aadhaar Authentication"
          description="Activate securely using your Aadhaar number and OTP."
        />
      </View>

      <View style={styles.bottom}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selected}
          loading={loading}
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
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 8, letterSpacing: -0.3, lineHeight: 34 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 28 },
  options: { gap: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  cardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#F5F3FF',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardIconSelected: {
    backgroundColor: '#EDE9FE',
  },
  cardIconText: { fontSize: 22 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 4 },
  cardTitleSelected: { color: '#4F46E5' },
  cardDesc: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: '#4F46E5' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4F46E5' },
  bottom: { position: 'absolute', bottom: 48, left: 24, right: 24 },
});

export default ActivationMethodScreen;
