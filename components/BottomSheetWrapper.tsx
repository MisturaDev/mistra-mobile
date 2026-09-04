import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { haptics } from '@/utils/haptics';

export interface BottomSheetWrapperProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  showCloseButton?: boolean;
  showHandle?: boolean;
  loading?: boolean;
  scrollable?: boolean;
  maxHeight?: `${number}%` | number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function BottomSheetWrapper({
  visible,
  onClose,
  title,
  subtitle,
  headerRight,
  showCloseButton = true,
  showHandle = true,
  loading = false,
  scrollable = false,
  maxHeight = '90%',
  contentContainerStyle,
  containerStyle,
  children,
}: BottomSheetWrapperProps) {
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    if (loading) return;
    haptics.lightImpact();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Tap backdrop to dismiss */}
        <Pressable
          style={styles.backdropPressable}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close bottom sheet"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.keyboardView, { maxHeight }]}
        >
          <View
            style={[
              styles.sheetContainer,
              { paddingBottom: scrollable ? 0 : Math.max(insets.bottom, Spacing.md) },
              containerStyle,
            ]}
          >
            {/* Drag Handle Indicator */}
            {showHandle ? (
              <View style={styles.handleContainer}>
                <View style={styles.dragHandle} />
              </View>
            ) : null}

            {/* Header (fixed at top of sheet) */}
            {title || headerRight || showCloseButton ? (
              <View style={styles.header}>
                <View style={styles.titleWrap}>
                  {title ? <Text style={styles.title}>{title}</Text> : null}
                  {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                </View>
                <View style={styles.headerActions}>
                  {headerRight}
                  {showCloseButton ? (
                    <TouchableOpacity
                      onPress={handleClose}
                      disabled={loading}
                      style={styles.closeButton}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="Close"
                    >
                      <Ionicons name="close" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* Content: Either ScrollView or raw container */}
            {scrollable ? (
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                bounces={true}
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: Math.max(insets.bottom, 16) + Spacing.xl },
                  contentContainerStyle,
                ]}
              >
                {children}
              </ScrollView>
            ) : (
              <View style={[styles.staticContent, contentContainerStyle]}>{children}</View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    width: '100%',
    maxHeight: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 20,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  dragHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  titleWrap: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  title: {
    ...Typography.h2,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  scrollView: {
    flexShrink: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  staticContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
});
