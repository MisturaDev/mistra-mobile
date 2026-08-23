import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Typography, Shadows } from '@/constants/theme';

type LogoSize = 'sm' | 'md' | 'lg';

const LOGO_SIZES: Record<
  LogoSize,
  { outer: number; middle: number; inner: number; wordmarkSize: number }
> = {
  sm: { outer: 52, middle: 36, inner: 18, wordmarkSize: 22 },
  md: { outer: 88, middle: 58, inner: 30, wordmarkSize: 28 },
  lg: { outer: 108, middle: 72, inner: 38, wordmarkSize: 32 },
};

export interface LogoProps {
  size?: LogoSize;
  showShadow?: boolean;
  showWordmark?: boolean;
  tagline?: string;
  style?: ViewStyle;
}

export function Logo({
  size = 'md',
  showShadow = false,
  showWordmark = false,
  tagline,
  style,
}: LogoProps) {
  const dimensions = LOGO_SIZES[size];
  const outerRadius = dimensions.outer / 2;
  const middleRadius = dimensions.middle / 2;
  const innerRadius = dimensions.inner / 2;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.outer,
          {
            width: dimensions.outer,
            height: dimensions.outer,
            borderRadius: outerRadius,
          },
          showShadow && Shadows.md,
        ]}
      >
        <View
          style={{
            width: dimensions.middle,
            height: dimensions.middle,
            borderRadius: middleRadius,
            backgroundColor: Colors.primaryMuted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: dimensions.inner,
              height: dimensions.inner,
              borderRadius: innerRadius,
              backgroundColor: Colors.primary,
            }}
          />
        </View>
      </View>

      {showWordmark ? (
        <View style={styles.wordmark}>
          <Text style={[styles.appName, { fontSize: dimensions.wordmarkSize }]}>Mistra</Text>
          {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  outer: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  appName: {
    ...Typography.h1,
    color: Colors.text,
    letterSpacing: 1.5,
  },
  tagline: {
    ...Typography.subtitle,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
});
