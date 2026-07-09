import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withDelay, withSpring, withTiming, withSequence,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Button from '../components/Button';
import { useRegistrationStore } from '../store/registrationStore';
import { setAuthToken } from '../api/client';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Success'>;
};

const SuccessScreen: React.FC<Props> = ({ navigation }) => {
  const { clear } = useRegistrationStore();
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslate = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    checkScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 100 }));
    checkOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
    textOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));
    textTranslate.value = withDelay(700, withTiming(0, { duration: 400 }));
    buttonOpacity.value = withDelay(1100, withTiming(1, { duration: 400 }));
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslate.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({ opacity: buttonOpacity.value }));

  const handleLogin = () => {
    // Navigate to Dashboard
    navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        {/* Animated checkmark */}
        <Animated.View style={[styles.checkCircle, checkStyle]}>
          <Text style={styles.checkIcon}>✓</Text>
        </Animated.View>

        <Animated.Text style={[styles.title, textStyle]}>
          Registration Completed{'\n'}Successfully!
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, textStyle]}>
          Your Dev Pay account is now active and ready to use.
        </Animated.Text>
      </View>

      <Animated.View style={[styles.bottom, buttonStyle]}>
        <Button title="Go to Dashboard" onPress={handleLogin} />
        <Text style={styles.footerText}>Your account is secured with end-to-end encryption</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  checkIcon: { fontSize: 44, color: '#FFFFFF', fontWeight: '700' },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  bottom: { paddingBottom: 48 },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default SuccessScreen;
