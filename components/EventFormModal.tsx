import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetWrapper } from '@/components/BottomSheetWrapper';
import type { EventCategory } from '@/types/dashboard';

export interface EventFormData {
  title: string;
  description: string;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  category: EventCategory;
  color: string;
  isAllDay: boolean;
}

interface EventFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  defaultDate?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialEventDate?: string;
  initialStartTime?: string | null;
  initialEndTime?: string | null;
  initialCategory?: EventCategory;
  initialColor?: string;
  initialIsAllDay?: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => void;
}

const TIME_PRESETS = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM', '06:00 PM'];

export function EventFormModal({
  visible,
  mode,
  defaultDate,
  initialTitle = '',
  initialDescription = '',
  initialEventDate,
  initialStartTime = null,
  initialEndTime = null,
  initialCategory = 'general',
  initialColor = '#7C3AED',
  initialIsAllDay = false,
  loading = false,
  onClose,
  onSubmit,
}: EventFormModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [eventDate, setEventDate] = useState(initialEventDate || defaultDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string | null>(initialStartTime);
  const [endTime, setEndTime] = useState<string | null>(initialEndTime);
  const [isAllDay, setIsAllDay] = useState(initialIsAllDay);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setDescription(initialDescription);
      setEventDate(initialEventDate || defaultDate || new Date().toISOString().split('T')[0]);
      setStartTime(initialStartTime);
      setEndTime(initialEndTime);
      setIsAllDay(initialIsAllDay);
      setError('');
    }
  }, [
    visible,
    defaultDate,
    initialTitle,
    initialDescription,
    initialEventDate,
    initialStartTime,
    initialEndTime,
    initialIsAllDay,
  ]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Enter an event title');
      return;
    }

    onSubmit({
      title: trimmed,
      description: description.trim(),
      eventDate,
      startTime: isAllDay ? null : startTime,
      endTime: isAllDay ? null : endTime,
      category: initialCategory || 'general',
      color: initialColor || '#7C3AED',
      isAllDay,
    });
  };

  return (
    <BottomSheetWrapper
      visible={visible}
      onClose={onClose}
      title={mode === 'create' ? 'New Event' : 'Edit Event'}
      subtitle={mode === 'create' ? 'Schedule a calendar event or reminder' : 'Update event details'}
      loading={loading}
      scrollable
      maxHeight="92%"
    >
      {/* Title Input */}
      <Input
        label="Event Title"
        placeholder="Meeting, session, or reminder..."
        value={title}
        onChangeText={(val) => {
          setTitle(val);
          if (error) setError('');
        }}
        error={error}
        autoFocus={mode === 'create'}
        disabled={loading}
      />

      {/* All Day Toggle */}
      <View style={styles.allDayRow}>
        <Text style={styles.allDayLabel}>All-day event</Text>
        <TouchableOpacity
          onPress={() => setIsAllDay(!isAllDay)}
          style={[styles.toggleTrack, isAllDay && styles.toggleTrackActive]}
          activeOpacity={0.8}
        >
          <View style={[styles.toggleThumb, isAllDay && styles.toggleThumbActive]} />
        </TouchableOpacity>
      </View>

      {/* Time Presets (if not all day) */}
      {!isAllDay ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Start Time</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {TIME_PRESETS.map((t) => {
              const isSelected = startTime === t;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setStartTime(t)}
                  style={[styles.timeChip, isSelected && styles.timeChipActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.timeChipText, isSelected && styles.timeChipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Description (Optional)</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Add details, link, or location..."
          placeholderTextColor={Colors.textLight}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Cancel"
          variant="outline"
          size="md"
          onPress={onClose}
          disabled={loading}
          style={styles.actionButton}
        />
        <Button
          title={mode === 'create' ? 'Create Event' : 'Save Changes'}
          variant="primary"
          size="md"
          loading={loading}
          onPress={handleSubmit}
          style={styles.actionButton}
        />
      </View>
    </BottomSheetWrapper>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  allDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  allDayLabel: {
    ...Typography.body,
    fontWeight: '500',
    color: Colors.text,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  timeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  timeChipText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  timeChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  descriptionInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.text,
    minHeight: 60,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
