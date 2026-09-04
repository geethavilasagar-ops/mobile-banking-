import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, TouchableOpacity } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  rightIcon,
  onRightIconPress,
  style,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused, !!error && styles.inputWrapperError]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#9CA3AF"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: '#4F46E5',
    backgroundColor: '#fff',
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: '#111827',
    fontWeight: '400',
  },
  rightIcon: {
    padding: 4,
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default InputField;
