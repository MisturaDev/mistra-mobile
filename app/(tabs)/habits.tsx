import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabScreenHeader } from '@/components/TabScreenHeader';
import { useTabScreenInsets } from '@/hooks/useTabBarStyle';

export default function HabitsScreen() {
  const tabInsets = useTabScreenInsets();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabInsets.paddingBottom }]}
      >
        <TabScreenHeader
          title="Habits"
          subtitle="Track routines and streaks"
        />
        <Text style={styles.placeholder}>Full habit tracking is coming soon.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  placeholder: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
