import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface TabScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function TabHeaderShell({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.shell, style]}>{children}</View>;
}

export function TabScreenHeader({ title, subtitle, right, style }: TabScreenHeaderProps) {
  return (
    <TabHeaderShell style={style}>
      <View style={styles.headerRow}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </TabHeaderShell>
  );
}

interface DashboardTabHeaderProps {
  greeting: string;
  firstName: string;
  date: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function DashboardTabHeader({
  greeting,
  firstName,
  date,
  right,
  style,
}: DashboardTabHeaderProps) {
  return (
    <TabHeaderShell style={style}>
      <View style={styles.headerRow}>
        <View style={styles.textWrap}>
          <Text style={styles.greetingText} numberOfLines={2}>
            {`${greeting}, `}
            <Text style={styles.nameHighlight}>{firstName}</Text>
          </Text>
          <Text style={styles.meta}>{date}</Text>
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </TabHeaderShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.xs,
  },
  right: {
    paddingTop: Spacing.xs,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  greetingText: {
    ...Typography.h2,
    color: Colors.text,
  },
  nameHighlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  meta: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
