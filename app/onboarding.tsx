import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { Logo } from '@/components/Logo';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type SlideKind = 'logo' | 'habits' | 'focus';

interface Slide {
  id: string;
  title: string;
  description: string;
  kind: SlideKind;
  accentBg: string;
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Your life, organized',
    description: 'Tasks, habits, and notes in one calm hub — so you always know what matters next.',
    kind: 'logo',
    accentBg: Colors.primaryLight,
  },
  {
    id: '2',
    title: 'Build habits that stick',
    description: 'Log daily routines, track streaks, and watch small wins compound over time.',
    kind: 'habits',
    accentBg: Colors.successLight,
  },
  {
    id: '3',
    title: 'Stay focused',
    description: 'A minimal workspace designed to cut noise and help you do one thing at a time.',
    kind: 'focus',
    accentBg: Colors.surface,
  },
];

function PreviewTaskRow({ title, completed }: { title: string; completed: boolean }) {
  return (
    <View style={previewStyles.row}>
      <View
        style={[
          previewStyles.checkbox,
          completed && previewStyles.checkboxDone,
        ]}
      >
        {completed ? <Ionicons name="checkmark" size={12} color={Colors.white} /> : null}
      </View>
      <Text
        style={[previewStyles.rowText, completed && previewStyles.rowTextDone]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  );
}

function HabitsPreview() {
  return (
    <View style={previewStyles.card}>
      <View style={previewStyles.habitRow}>
        <View style={previewStyles.habitInfo}>
          <Text style={previewStyles.habitName}>Morning run</Text>
          <View style={previewStyles.streakRow}>
            <Ionicons name="flame" size={14} color="#F59E0B" />
            <Text style={previewStyles.streakText}>12 day streak</Text>
          </View>
        </View>
        <View style={previewStyles.habitDone}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
          <Text style={previewStyles.habitDoneText}>Done</Text>
        </View>
      </View>
      <View style={previewStyles.weekRow}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <View
            key={`${day}-${index}`}
            style={[
              previewStyles.dayDot,
              index < 5 ? previewStyles.dayDotActive : null,
            ]}
          >
            <Text
              style={[
                previewStyles.dayLabel,
                index < 5 ? previewStyles.dayLabelActive : null,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function FocusPreview() {
  return (
    <View style={previewStyles.card}>
      <View style={previewStyles.focusHeader}>
        <Text style={previewStyles.focusLabel}>Today</Text>
        <View style={previewStyles.focusBadge}>
          <Text style={previewStyles.focusBadgeText}>2 left</Text>
        </View>
      </View>
      <PreviewTaskRow title="Deep work session" completed={false} />
      <PreviewTaskRow title="Reply to messages" completed={false} />
      <View style={previewStyles.focusFooter}>
        <Ionicons name="leaf-outline" size={14} color={Colors.textSecondary} />
        <Text style={previewStyles.focusFooterText}>One thing at a time</Text>
      </View>
    </View>
  );
}

function SlideVisual({ item }: { item: Slide }) {
  return (
    <View style={[styles.visualContainer, { backgroundColor: item.accentBg }]}>
      {item.kind === 'logo' ? (
        <Logo size="lg" showShadow showWordmark />
      ) : null}
      {item.kind === 'habits' ? <HabitsPreview /> : null}
      {item.kind === 'focus' ? <FocusPreview /> : null}
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const setOnboardingCompleted = useAppStore((state) => state.setOnboardingCompleted);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);
  const isLastSlide = currentIndex === slides.length - 1;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    await setOnboardingCompleted(true);
    router.replace('/(auth)/welcome');
  };

  const renderSlide = ({ item }: { item: Slide }) => {
    return (
      <View style={styles.slide}>
        <SlideVisual item={item} />
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        style={styles.list}
      />

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <TouchableOpacity
            onPress={handleSkip}
            disabled={isLastSlide}
            activeOpacity={0.7}
            style={styles.skipHitArea}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={[styles.skipText, isLastSlide && styles.skipHidden]}>Skip</Text>
          </TouchableOpacity>

          <View style={styles.pagination}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentIndex === index ? styles.activeDot : null,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            style={styles.nextButton}
            accessibilityRole="button"
            accessibilityLabel={isLastSlide ? 'Get started' : 'Next slide'}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? 'Get Started' : 'Next'}
            </Text>
            {!isLastSlide ? (
              <Ionicons name="arrow-forward" size={16} color={Colors.white} />
            ) : null}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const previewStyles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: Radius.xs,
    borderWidth: 1.5,
    borderColor: Colors.textLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rowText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  rowTextDone: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  habitInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  habitName: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  streakText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  habitDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.successLight,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
  },
  habitDoneText: {
    ...Typography.captionBold,
    color: Colors.success,
    fontSize: 11,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotActive: {
    backgroundColor: Colors.successLight,
  },
  dayLabel: {
    ...Typography.caption,
    color: Colors.textLight,
    fontWeight: '600',
    fontSize: 10,
  },
  dayLabelActive: {
    color: Colors.success,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  focusLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  focusBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  focusBadgeText: {
    ...Typography.captionBold,
    color: Colors.primary,
    fontSize: 11,
  },
  focusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  focusFooterText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  list: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.lg,
  },
  visualContainer: {
    width: '100%',
    minHeight: 280,
    borderRadius: Radius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    marginBottom: Spacing.xxl,
    ...Shadows.md,
  },
  slideTitle: {
    ...Typography.h1,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  slideDescription: {
    ...Typography.subtitle,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.white,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipHitArea: {
    minWidth: 52,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  skipHidden: {
    opacity: 0,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    minWidth: 52,
  },
  nextButtonText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
});
