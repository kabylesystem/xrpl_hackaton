import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

interface NFCAnimationProps {
  isActive: boolean;
  size?: number;
}

export const NFCAnimation: React.FC<NFCAnimationProps> = ({
  isActive,
  size = 120,
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotate animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [isActive, pulseAnim, rotateAnim]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Pulse circles */}
      {isActive && (
        <>
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                width: size * 0.8,
                height: size * 0.8,
                borderRadius: (size * 0.8) / 2,
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />
        </>
      )}

      {/* NFC Icon */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ rotate }],
          },
        ]}
      >
        <Ionicons name="phone-portrait-outline" size={size * 0.5} color={colors.primary} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseCircle: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
