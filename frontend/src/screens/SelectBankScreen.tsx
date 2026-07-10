import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Bank } from '../types';
import BankCard from '../components/BankCard';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import apiClient from '../api/client';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SelectBank'>;
  route: RouteProp<RootStackParamList, 'SelectBank'>;
};

const SelectBankScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filtered, setFiltered] = useState<Bank[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Bank | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      setFiltered(banks.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())));
    } else {
      setFiltered(banks);
    }
  }, [search, banks]);

  const fetchBanks = async () => {
    try {
      const res = await apiClient.get('/banks');
      setBanks(res.data.data.banks);
      setFiltered(res.data.data.banks);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load banks. Please check your connection.');
    } finally {
      setFetching(false);
    }
  };

  const handleContinue = () => {
    if (!selected) return;
    navigation.navigate('ActivationMethod', {
      userId,
      bankId: selected._id,
      bankName: selected.name,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepText}>Step 3 of 7</Text>
        <View style={{ width: 32 }} />
      </View>

      <ProgressBar current={3} total={7} />

      <Text style={styles.title}>Select your bank</Text>
      <Text style={styles.subtitle}>Choose the bank you'd like to link.</Text>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search banks"
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Bank List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <BankCard
            bank={item}
            selected={selected?._id === item._id}
            onSelect={setSelected}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {fetching ? 'Loading banks...' : 'No banks found.'}
          </Text>
        }
      />

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
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 6, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 48,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
  bottom: { position: 'absolute', bottom: 48, left: 24, right: 24 },
});

export default SelectBankScreen;
