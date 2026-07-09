import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, withSpring, Easing,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslate = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslate = useSharedValue(30);

  useEffect(() => {
    logoScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    titleTranslate.value = withDelay(600, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));
    buttonOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
    buttonTranslate.value = withDelay(1000, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslate.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslate.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background circles for visual depth */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      {/* Center content */}
      <View style={styles.center}>
        <Animated.View style={[styles.iconContainer, logoStyle]}>
          <Text style={styles.icon}>🏦</Text>
        </Animated.View>
        <Animated.Text style={[styles.title, titleStyle]}>Dev Pay</Animated.Text>
        <Animated.Text style={[styles.subtitle, titleStyle]}>
          Secure. Fast. Reliable.
        </Animated.Text>
      </View>

      {/* Bottom button */}
      <Animated.View style={[styles.buttonWrapper, buttonStyle]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('PersonalInfo')}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>Get Started  →</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3730A3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle1: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: 'rgba(99, 84, 234, 0.35)',
    top: -width * 0.3,
    right: -width * 0.2,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(99, 84, 234, 0.25)',
    bottom: -width * 0.15,
    left: -width * 0.15,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 38,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.3,
  },
  buttonWrapper: {
    width: '100%',
    paddingHorizontal: 28,
    paddingBottom: 48,
  },
  button: {
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3730A3',
    letterSpacing: 0.3,
  },
});

export default SplashScreen;
