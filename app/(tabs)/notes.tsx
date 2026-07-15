import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Notes</Text>
      <Text style={styles.placeholder}>Your personal knowledge base. Coming soon.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  placeholder: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
