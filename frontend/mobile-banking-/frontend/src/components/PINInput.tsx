import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';

interface PINInputProps {
  label: string;
  onComplete: (pin: string) => void;
  error?: string;
}

const PINInput: React.FC<PINInputProps> = ({ label, onComplete, error }) => {
  const [values, setValues] = useState<string[]>(['', '', '', '']);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(-1);
    const newValues = [...values];
    newValues[index] = cleaned;
    setValues(newValues);

    if (cleaned && index < 3) {
      inputs.current[index + 1]?.focus();
    }

    if (newValues.every((v) => v !== '')) {
      onComplete(newValues.join(''));
    } else {
      onComplete('');
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {values.map((val, index) => (
          <View key={index} style={[styles.dotWrapper, val ? styles.dotFilled : styles.dotEmpty, !!error && styles.dotError]}>
            <TextInput
              ref={(ref) => { inputs.current[index] = ref; }}
              style={styles.hiddenInput}
              value={val}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry
              caretHidden
            />
            {val ? <View style={styles.dot} /> : null}
          </View>
        ))}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  dotWrapper: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  dotEmpty: {
    backgroundColor: '#F5F3FF',
    borderColor: '#E5E7EB',
  },
  dotFilled: {
    backgroundColor: '#F5F3FF',
    borderColor: '#4F46E5',
  },
  dotError: {
    borderColor: '#EF4444',
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4F46E5',
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default PINInput;
