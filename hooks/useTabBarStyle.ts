import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { Spacing, Typography } from '@/constants/theme';

const TAB_BAR_CONTENT_HEIGHT = Platform.select({ ios: 52, android: 56, default: 56 }) ?? 56;

export function useTabBarStyle() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;

  return {
    tabBarStyle: {
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
      height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
      paddingTop: Spacing.xs,
      paddingBottom: Math.max(insets.bottom, Spacing.xs),
    },
    tabBarLabelStyle: {
      ...Typography.captionBold,
      fontSize: compact ? 9 : 10,
      marginTop: 2,
    },
    tabBarItemStyle: {
      paddingVertical: compact ? 2 : 4,
      minWidth: compact ? 56 : 64,
    },
    tabBarIconStyle: {
      marginTop: 2,
    },
    tabBarShowLabel: width >= 320,
  } as const;
}

export function useTabScreenInsets() {
  const insets = useSafeAreaInsets();

  return {
    paddingBottom: TAB_BAR_CONTENT_HEIGHT + insets.bottom + Spacing.md,
  };
}
