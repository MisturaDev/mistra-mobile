import { Switch, View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface SettingToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function SettingToggle({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: SettingToggleProps) {
  return (
    <View style={[styles.row, disabled && styles.disabled]}>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: Colors.border, true: Colors.primaryMuted }}
        thumbColor={value ? Colors.primary : Colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  description: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  disabled: {
    opacity: 0.5,
  },
});
