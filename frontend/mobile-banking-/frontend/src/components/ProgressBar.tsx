import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  current: number;
  total: number;
  onBack?: () => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progress = current / total;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    marginBottom: 28,
  },
  track: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
});

export default ProgressBar;
