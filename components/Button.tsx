import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props
}) => {
  const isDarkSecondary = variant === 'secondary';
  
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = styles.container;
    
    // Variant Styles
    let variantStyle: ViewStyle = {};
    switch (variant) {
      case 'primary':
        variantStyle = {
          backgroundColor: Colors.primary,
        };
        break;
      case 'secondary':
        variantStyle = {
          backgroundColor: Colors.primaryLight,
        };
        break;
      case 'outline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.border,
        };
        break;
      case 'text':
        variantStyle = {
          backgroundColor: 'transparent',
          paddingHorizontal: Spacing.xs,
        };
        break;
    }

    // Size Styles
    let sizeStyle: ViewStyle = {};
    switch (size) {
      case 'sm':
        sizeStyle = {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          borderRadius: Radius.sm,
          minHeight: 36,
        };
        break;
      case 'md':
        sizeStyle = {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.xl,
          borderRadius: Radius.md,
          minHeight: 48,
        };
        break;
      case 'lg':
        sizeStyle = {
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing.xxl,
          borderRadius: Radius.lg,
          minHeight: 56,
        };
        break;
    }

    // Disabled Styles
    const disabledStyle: ViewStyle = disabled ? { opacity: 0.5 } : {};

    return { ...baseStyle, ...variantStyle, ...sizeStyle, ...disabledStyle, ...(style as object) };
  };

  const getTextStyle = (): TextStyle => {
    let variantTextStyle: TextStyle = {};
    
    switch (variant) {
      case 'primary':
        variantTextStyle = {
          color: Colors.white,
          fontWeight: '600',
        };
        break;
      case 'secondary':
        variantTextStyle = {
          color: Colors.primary,
          fontWeight: '600',
        };
        break;
      case 'outline':
        variantTextStyle = {
          color: Colors.text,
          fontWeight: '500',
        };
        break;
      case 'text':
        variantTextStyle = {
          color: Colors.primary,
          fontWeight: '600',
        };
        break;
    }

    let sizeTextStyle: TextStyle = {};
    switch (size) {
      case 'sm':
        sizeTextStyle = { fontSize: Typography.caption.fontSize };
        break;
      case 'md':
        sizeTextStyle = { fontSize: Typography.body.fontSize };
        break;
      case 'lg':
        sizeTextStyle = { fontSize: Typography.subtitle.fontSize };
        break;
    }

    return { ...styles.text, ...variantTextStyle, ...sizeTextStyle, ...textStyle };
  };

  const getLoaderColor = () => {
    if (variant === 'primary') return Colors.white;
    return Colors.primary;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={getContainerStyle()}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getLoaderColor()} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  text: {
    textAlign: 'center',
  },
});
