import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Button } from '../components';

const { width } = Dimensions.get('window');
const ONBOARDING_SEEN_KEY = '@xrpl_onboarding_seen';

const slides = [
  {
    title: 'Pay in NGN, settle in USDC',
    subtitle: 'Enter any amount in naira and we handle the FX on XRPL.',
    icon: 'cash-outline',
  },
  {
    title: 'Offline ready with SMS + NFC',
    subtitle: 'No internet? Use text or tap-to-pay to complete payments.',
    icon: 'wifi-off-outline',
  },
  {
    title: 'Powered by XRPL testnet',
    subtitle: 'Instant settlement, low fees, and transparent transactions.',
    icon: 'flash-outline',
  },
];

interface OnboardingScreenProps {
  navigation: any;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [current, setCurrent] = useState(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const seen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
      if (seen) {
        navigation.replace('WalletSetup');
      } else {
        setChecking(false);
      }
    };

    checkStatus();
  }, [navigation]);

  const markComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    navigation.replace('WalletSetup');
  };

  const handleNext = async () => {
    if (current < slides.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      await markComplete();
    }
  };

  if (checking) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.badge}>XRPL Hackathon</Text>
        <Text style={styles.title}>TundePay</Text>
        <Text style={styles.subtitle}>NGN ↔ USDC bridge, ready for offline payments.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name={slides[current].icon as any} size={28} color={colors.primary} />
        </View>
        <Text style={styles.slideTitle}>{slides[current].title}</Text>
        <Text style={styles.slideSubtitle}>{slides[current].subtitle}</Text>

        <View style={styles.progressDots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === current && {
                  backgroundColor: colors.primary,
                  width: 24,
                },
              ]}
            />
          ))}
        </View>

        <Button
          title={current === slides.length - 1 ? 'Get started' : 'Next'}
          onPress={handleNext}
          style={styles.cta}
        />
        <TouchableOpacity onPress={markComplete} style={styles.skip}>
          <Text style={styles.skipText}>Skip onboarding</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  badge: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h1,
    marginTop: spacing.sm,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    ...shadows.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  slideSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.lg,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  cta: {
    marginTop: spacing.lg,
    width: width - spacing.xl * 2,
  },
  skip: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  skipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
