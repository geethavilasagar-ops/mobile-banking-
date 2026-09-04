import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete, error }) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(-1);
    const newValues = [...values];
    newValues[index] = cleaned;
    setValues(newValues);

    if (cleaned && index < length - 1) {
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
    <View>
      <View style={styles.row}>
        {values.map((val, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputs.current[index] = ref; }}
            style={[styles.box, val ? styles.boxFilled : {}, !!error && styles.boxError]}
            value={val}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            selectTextOnFocus
            autoFocus={index === 0}
          />
        ))}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  box: {
    width: 48,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F0EFFF',
    fontSize: 22,
    fontWeight: '700',
    color: '#4F46E5',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  boxFilled: {
    borderColor: '#4F46E5',
    backgroundColor: '#FFFFFF',
  },
  boxError: {
    borderColor: '#EF4444',
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default OTPInput;
