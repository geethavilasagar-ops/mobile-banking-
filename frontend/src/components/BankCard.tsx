import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bank } from '../types';

interface BankCardProps {
  bank: Bank;
  selected: boolean;
  onSelect: (bank: Bank) => void;
}

const BankCard: React.FC<BankCardProps> = ({ bank, selected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.row, selected && styles.rowSelected]}
      onPress={() => onSelect(bank)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: bank.color }]}>
        <Text style={styles.avatarText}>{bank.abbreviation}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{bank.name}</Text>
        <Text style={styles.status}>Supported</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowSelected: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
    color: '#6B7280',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#4F46E5',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4F46E5',
  },
});

export default BankCard;
