import { Platform } from 'react-native';

export const Colors = {
  primary: '#7C3AED',       // Mistra Purple
  primaryLight: '#F5F3FF',  // Very soft purple backdrop
  primaryDark: '#6D28D9',
  
  white: '#FFFFFF',
  background: '#FFFFFF',
  surface: '#F9FAFB',       // Off-white / light gray backdrop
  card: '#FFFFFF',
  
  text: '#111827',          // Near black
  textSecondary: '#4B5563', // Muted gray
  textLight: '#9CA3AF',     // Muted placeholder gray
  
  border: '#E5E7EB',        // Light grey border
  borderLight: '#F3F4F6',   // Extremely soft grey border
  
  success: '#10B981',       // Emerald green
  successLight: '#D1FAE5',  // Very soft green backdrop
  error: '#EF4444',         // Bright red
  errorLight: '#FEE2E2',    // Very soft red backdrop
} as const;

export const Spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

export const Typography = {
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500' as const,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  bodyBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  captionBold: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
} as const;

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#7C3AED', // Slightly tinted shadow for primary elements if needed, or neutral
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export const MaxContentWidth = 800;
