import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

interface WeekStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateString: string) => void;
  dotCounts?: Record<string, { eventCount: number; taskCount: number }>;
}

const WEEKDAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function WeekStrip({
  selectedDate,
  onSelectDate,
  dotCounts = {},
}: WeekStripProps) {
  const todayString = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute the 7 days of the current week (Monday-Sunday) based on selectedDate
  const weekDays = useMemo(() => {
    const current = new Date(selectedDate);
    const dayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(current);
    monday.setDate(current.getDate() + mondayOffset);

    const days: { dayNumber: number; dateString: string; weekday: string }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateString = `${y}-${m}-${day}`;

      days.push({
        dayNumber: d.getDate(),
        dateString,
        weekday: WEEKDAY_NAMES[i],
      });
    }

    return days;
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {weekDays.map((item) => {
          const isSelected = item.dateString === selectedDate;
          const isToday = item.dateString === todayString;
          const dots = dotCounts[item.dateString];
          const hasEvents = dots && dots.eventCount > 0;
          const hasTasks = dots && dots.taskCount > 0;

          return (
            <TouchableOpacity
              key={item.dateString}
              onPress={() => onSelectDate(item.dateString)}
              style={[
                styles.dayCard,
                isSelected && styles.dayCardSelected,
                isToday && !isSelected && styles.dayCardToday,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.weekdayText,
                  isSelected && styles.weekdayTextSelected,
                  isToday && !isSelected && styles.weekdayTextToday,
                ]}
              >
                {item.weekday}
              </Text>

              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                  isToday && !isSelected && styles.dayNumberToday,
                ]}
              >
                {item.dayNumber}
              </Text>

              {/* Activity indicator dots */}
              <View style={styles.dotsRow}>
                {hasEvents ? (
                  <View
                    style={[
                      styles.dot,
                      isSelected ? styles.dotWhite : { backgroundColor: Colors.primary },
                    ]}
                  />
                ) : null}
                {hasTasks ? (
                  <View
                    style={[
                      styles.dot,
                      isSelected ? styles.dotWhite : { backgroundColor: '#10B981' },
                    ]}
                  />
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 2,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dayCardToday: {
    borderColor: Colors.primaryMuted,
    backgroundColor: Colors.primaryLight,
  },
  dayCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  weekdayText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  weekdayTextToday: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  weekdayTextSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
  },
  dayNumber: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 16,
  },
  dayNumberToday: {
    color: Colors.primary,
  },
  dayNumberSelected: {
    color: Colors.white,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
    height: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotWhite: {
    backgroundColor: Colors.white,
  },
});
