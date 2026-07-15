import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Your Life, Organized',
    description: 'The personal operating system that brings tasks, habits, notes, and calendar goals into a single minimal hub.',
    icon: 'calendar-clear-outline',
  },
  {
    id: '2',
    title: 'Track Habits Effortlessly',
    description: 'Build healthy routines and watch your progress compound. Beautiful visual guides keep you motivated daily.',
    icon: 'sparkles-outline',
  },
  {
    id: '3',
    title: 'Minimalism at Core',
    description: 'Designed to eliminate cognitive overload. Focused workspaces, clean aesthetics, and notifications that respect your time.',
    icon: 'leaf-outline',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const setOnboardingCompleted = useAppStore((state) => state.setOnboardingCompleted);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

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

  const handleFinish = () => {
    setOnboardingCompleted(true);
    router.replace('/(auth)/welcome');
  };

  const renderSlide = ({ item }: { item: Slide }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon} size={80} color={Colors.primary} />
        </View>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentIndex < slides.length - 1 ? (
        <Button
          title="Skip"
          variant="text"
          size="sm"
          onPress={handleSkip}
          style={styles.skipButton}
        />
      ) : (
        <View style={styles.skipPlaceholder} />
      )}

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      <View style={styles.footer}>
        {/* Pagination Dots */}
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

        {/* Action Button */}
        <Button
          title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          variant={currentIndex === slides.length - 1 ? 'primary' : 'outline'}
          size="lg"
          onPress={handleNext}
          style={styles.actionBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'space-between',
  },
  skipButton: {
    alignSelf: 'flex-end',
    marginRight: Spacing.xl,
    marginTop: Spacing.sm,
  },
  skipPlaceholder: {
    height: 36,
  },
  list: {
    flexGrow: 0,
  },
  slide: {
    width: width,
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    justifyContent: 'center',
    paddingBottom: Spacing.xxxl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: Radius.xxl,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
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
  actionBtn: {
    width: '100%',
  },
});
