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
import type { GoalCategory, Goal } from '@/types/dashboard';

export interface GoalFormData {
  title: string;
  description: string;
  category: GoalCategory;
  targetDate: string | null;
  targetValue: number;
  currentValue: number;
  unit: string;
  color: string;
}

interface GoalFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialGoal?: Goal | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => void;
}

const CATEGORIES: {
  key: GoalCategory;
  label: string;
  color: string;
  bg: string;
}[] = [
  { key: 'personal', label: 'Personal', color: '#7C3AED', bg: '#F5F3FF' },
  { key: 'career', label: 'Career', color: '#2563EB', bg: '#EFF6FF' },
  { key: 'health', label: 'Health', color: '#059669', bg: '#ECFDF5' },
  { key: 'finance', label: 'Finance', color: '#D97706', bg: '#FFFBEB' },
  { key: 'learning', label: 'Learning', color: '#DB2777', bg: '#FDF2F8' },
];

const UNIT_PRESETS = [
  { label: 'Percentage (%)', unit: '%' },
  { label: 'Items / Count', unit: 'items' },
  { label: 'Currency ($)', unit: '$' },
  { label: 'Hours (hrs)', unit: 'hrs' },
  { label: 'Days (days)', unit: 'days' },
];

const TARGET_DATE_PRESETS: {
  key: string;
  label: string;
  getDate: () => string | null;
}[] = [
  { key: 'none', label: 'No date', getDate: () => null },
  {
    key: '1m',
    label: '1 Month',
    getDate: () => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d.toISOString().split('T')[0];
    },
  },
  {
    key: '3m',
    label: '3 Months',
    getDate: () => {
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      return d.toISOString().split('T')[0];
    },
  },
  {
    key: '6m',
    label: '6 Months',
    getDate: () => {
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      return d.toISOString().split('T')[0];
    },
  },
  {
    key: 'eoy',
    label: 'End of Year',
    getDate: () => {
      const now = new Date();
      return `${now.getFullYear()}-12-31`;
    },
  },
];

export function GoalFormModal({
  visible,
  mode,
  initialGoal,
  loading = false,
  onClose,
  onSubmit,
}: GoalFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('personal');
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [targetValueStr, setTargetValueStr] = useState('100');
  const [currentValueStr, setCurrentValueStr] = useState('0');
  const [unit, setUnit] = useState('%');
  const [color, setColor] = useState('#7C3AED');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      if (initialGoal) {
        setTitle(initialGoal.title);
        setDescription(initialGoal.description || '');
        setCategory(initialGoal.category);
        setTargetDate(initialGoal.targetDate || null);
        setTargetValueStr(String(initialGoal.targetValue || 100));
        setCurrentValueStr(String(initialGoal.currentValue || 0));
        setUnit(initialGoal.unit || '%');
        setColor(initialGoal.color || '#7C3AED');
      } else {
        setTitle('');
        setDescription('');
        setCategory('personal');
        setTargetDate(null);
        setTargetValueStr('100');
        setCurrentValueStr('0');
        setUnit('%');
        setColor('#7C3AED');
      }
      setError('');
    }
  }, [visible, initialGoal]);

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Enter a goal title');
      return;
    }

    const parsedTarget = parseFloat(targetValueStr) || 100;
    const parsedCurrent = parseFloat(currentValueStr) || 0;

    if (parsedTarget <= 0) {
      setError('Target value must be greater than 0');
      return;
    }

    onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      category,
      targetDate,
      targetValue: parsedTarget,
      currentValue: parsedCurrent,
      unit: unit.trim() || '%',
      color,
    });
  };

  const handleCategorySelect = (selectedCat: GoalCategory) => {
    setCategory(selectedCat);
    const catPreset = CATEGORIES.find((c) => c.key === selectedCat);
    if (catPreset) {
      setColor(catPreset.color);
    }
  };

  return (
    <BottomSheetWrapper
      visible={visible}
      onClose={onClose}
      title={mode === 'create' ? 'New Goal' : 'Edit Goal'}
      subtitle={
        mode === 'create'
          ? 'Define a clear milestone and track your progress'
          : 'Update your goal targets and metrics'
      }
      loading={loading}
      scrollable
      maxHeight="92%"
    >
      {/* Title */}
      <Input
        label="Goal Title"
        placeholder="e.g. Read 12 Books, Emergency Fund, Run 10k"
        value={title}
        onChangeText={(val) => {
          setTitle(val);
          if (error) setError('');
        }}
        error={error}
        autoFocus={mode === 'create'}
        disabled={loading}
      />

      {/* Category Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.chipRow}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => handleCategorySelect(cat.key)}
                style={[
                  styles.categoryChip,
                  isSelected && {
                    backgroundColor: cat.bg,
                    borderColor: cat.color,
                    borderWidth: 1.5,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && { color: cat.color, fontWeight: '700' },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Metric Unit Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Metric / Unit</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.chipRow}
        >
          {UNIT_PRESETS.map((preset) => {
            const isSelected = unit === preset.unit;
            return (
              <TouchableOpacity
                key={preset.unit}
                onPress={() => setUnit(preset.unit)}
                style={[styles.unitChip, isSelected && styles.unitChipSelected]}
                activeOpacity={0.7}
              >
                <Text style={[styles.unitChipText, isSelected && styles.unitChipTextSelected]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Numerical Target & Current Inputs */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Progress Values</Text>
        <View style={styles.valuesRow}>
          <View style={styles.valueInputCol}>
            <Text style={styles.inputSubLabel}>Current ({unit})</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={currentValueStr}
              onChangeText={setCurrentValueStr}
              placeholder="0"
              placeholderTextColor={Colors.textLight}
              style={styles.valueInput}
              editable={!loading}
            />
          </View>
          <View style={styles.valueDivider}>
            <Text style={styles.valueDividerText}>/</Text>
          </View>
          <View style={styles.valueInputCol}>
            <Text style={styles.inputSubLabel}>Target ({unit})</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={targetValueStr}
              onChangeText={setTargetValueStr}
              placeholder="100"
              placeholderTextColor={Colors.textLight}
              style={styles.valueInput}
              editable={!loading}
            />
          </View>
        </View>
      </View>

      {/* Target Date Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Target Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.chipRow}
        >
          {TARGET_DATE_PRESETS.map((p) => {
            const calculated = p.getDate();
            const isSelected = targetDate === calculated;
            return (
              <TouchableOpacity
                key={p.key}
                onPress={() => setTargetDate(calculated)}
                style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateChipText, isSelected && styles.dateChipTextSelected]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {targetDate && (
          <View style={styles.selectedDateBadge}>
            <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
            <Text style={styles.selectedDateText}>Target: {targetDate}</Text>
            <TouchableOpacity onPress={() => setTargetDate(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Description / Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Description (Optional)</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Why does this goal matter? Any milestones or notes?"
          placeholderTextColor={Colors.textLight}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          editable={!loading}
        />
      </View>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={mode === 'create' ? 'Create Goal' : 'Save Changes'}
          variant="primary"
          size="lg"
          loading={loading}
          onPress={handleSubmit}
        />
      </View>
    </BottomSheetWrapper>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  unitChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  unitChipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  unitChipTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  valuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  valueInputCol: {
    flex: 1,
  },
  inputSubLabel: {
    ...Typography.caption,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  valueInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  valueDivider: {
    paddingTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueDividerText: {
    fontSize: 22,
    fontWeight: '300',
    color: Colors.textLight,
  },
  dateChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  dateChipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dateChipTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  selectedDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    alignSelf: 'flex-start',
  },
  selectedDateText: {
    ...Typography.captionBold,
    color: Colors.primaryDark,
  },
  descriptionInput: {
    minHeight: 75,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.text,
  },
  buttonContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
});
