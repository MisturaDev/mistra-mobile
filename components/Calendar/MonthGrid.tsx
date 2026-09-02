import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

interface MonthGridProps {
  year: number;
  month: number; // 0-indexed (0 = Jan, 11 = Dec)
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateString: string) => void;
  dotCounts?: Record<string, { eventCount: number; taskCount: number }>;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function MonthGrid({
  year,
  month,
  selectedDate,
  onSelectDate,
  dotCounts = {},
}: MonthGridProps) {
  const todayString = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute calendar grid cells
  const gridCells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Monday = 0, Sunday = 6
    let startDayIndex = firstDay.getDay() - 1;
    if (startDayIndex === -1) startDayIndex = 6;

    const cells: ({ day: number; dateString: string; isCurrentMonth: boolean } | null)[] = [];

    // Empty cells before first day
    for (let i = 0; i < startDayIndex; i++) {
      cells.push(null);
    }

    // Days of current month
    for (let day = 1; day <= totalDays; day++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateString = `${year}-${mStr}-${dStr}`;
      cells.push({ day, dateString, isCurrentMonth: true });
    }

    return cells;
  }, [year, month]);

  return (
    <View style={styles.container}>
      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((wd, index) => (
          <View key={index} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{wd}</Text>
          </View>
        ))}
      </View>

      {/* Date Grid */}
      <View style={styles.grid}>
        {gridCells.map((cell, index) => {
          if (!cell) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const isSelected = cell.dateString === selectedDate;
          const isToday = cell.dateString === todayString;
          const dots = dotCounts[cell.dateString];
          const hasEvents = dots && dots.eventCount > 0;
          const hasTasks = dots && dots.taskCount > 0;

          return (
            <TouchableOpacity
              key={cell.dateString}
              onPress={() => onSelectDate(cell.dateString)}
              style={styles.dayCell}
              activeOpacity={0.6}
            >
              <View
                style={[
                  styles.dayButton,
                  isToday && styles.dayButtonToday,
                  isSelected && styles.dayButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    isToday && styles.dayNumberToday,
                    isSelected && styles.dayNumberSelected,
                  ]}
                >
                  {cell.day}
                </Text>
              </View>

              {/* Indicator Dots */}
              <View style={styles.dotsRow}>
                {hasEvents ? (
                  <View style={[styles.dot, isSelected ? styles.dotSelected : { backgroundColor: Colors.primary }]} />
                ) : null}
                {hasTasks ? (
                  <View style={[styles.dot, isSelected ? styles.dotSelected : { backgroundColor: '#10B981' }]} />
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
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 4,
    height: 48,
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayNumber: {
    ...Typography.body,
    fontWeight: '500',
    color: Colors.text,
    fontSize: 14,
  },
  dayNumberToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
  dayNumberSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
    height: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotSelected: {
    backgroundColor: Colors.primary,
  },
});
