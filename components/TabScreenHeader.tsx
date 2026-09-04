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
  subtitle?: string;
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
      <View style={styles.dashboardHeaderRow}>
        <View style={styles.dashboardTextWrap}>
          <Text style={styles.greetingText} numberOfLines={1}>
            {`${greeting}, `}
            <Text style={styles.nameHighlight}>{firstName}</Text>
          </Text>
          <Text style={styles.dateText} numberOfLines={1}>
            {date}
          </Text>
        </View>
        {right ? <View style={styles.dashboardRight}>{right}</View> : null}
      </View>
    </TabHeaderShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.xs,
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
    gap: 4,
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
  dashboardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dashboardTextWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 6,
    gap: 3,
  },
  dashboardRight: {
    flexShrink: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  greetingText: {
    ...Typography.h1,
    fontSize: 22,
    lineHeight: 28,
    color: Colors.text,
  },
  nameHighlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  dateText: {
    ...Typography.body,
    fontSize: 13.5,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
