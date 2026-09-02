import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useEvents } from '@/hooks/useEvents';
import { useTasks } from '@/hooks/useTasks';
import { MonthGrid } from '@/components/Calendar/MonthGrid';
import { WeekStrip } from '@/components/Calendar/WeekStrip';
import { AgendaEventCard, AgendaTaskCard } from '@/features/calendar/AgendaItem';
import { EventFormModal, EventFormData } from '@/components/EventFormModal';
import { TaskFormModal, TaskFormData } from '@/components/TaskFormModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { toast } from '@/components/AppToast';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import type { CalendarEvent } from '@/types/dashboard';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function CalendarScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;

  const today = useMemo(() => new Date(), []);
  const todayString = useMemo(() => today.toISOString().split('T')[0], [today]);

  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const [eventForm, setEventForm] = useState<
    { mode: 'create'; defaultDate?: string } | { mode: 'edit'; event: CalendarEvent } | null
  >(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

  const [taskFormVisible, setTaskFormVisible] = useState(false);

  const {
    events,
    isLoading: eventsLoading,
    isSaving: eventsSaving,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents(userId);

  const {
    tasks,
    isLoading: tasksLoading,
    toggleTask,
    createTask,
  } = useTasks(userId);

  const isLoading = eventsLoading || tasksLoading;

  // Compute activity dots map: dateString -> { eventCount, taskCount }
  const dotCounts = useMemo(() => {
    const map: Record<string, { eventCount: number; taskCount: number }> = {};

    events.forEach((ev) => {
      if (!map[ev.eventDate]) {
        map[ev.eventDate] = { eventCount: 0, taskCount: 0 };
      }
      map[ev.eventDate].eventCount += 1;
    });

    tasks.forEach((t) => {
      if (t.dueDate) {
        if (!map[t.dueDate]) {
          map[t.dueDate] = { eventCount: 0, taskCount: 0 };
        }
        map[t.dueDate].taskCount += 1;
      }
    });

    return map;
  }, [events, tasks]);

  // Selected date's events and tasks
  const dayEvents = useMemo(() => {
    return events.filter((ev) => ev.eventDate === selectedDate);
  }, [events, selectedDate]);

  const dayTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === selectedDate);
  }, [tasks, selectedDate]);

  const totalAgendaItems = dayEvents.length + dayTasks.length;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleJumpToToday = () => {
    setSelectedDate(todayString);
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const d = new Date(dateStr);
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
  };

  // Format header for selected day agenda
  const formattedSelectedDate = useMemo(() => {
    try {
      const d = new Date(selectedDate);
      if (isNaN(d.getTime())) return selectedDate;
      const isToday = selectedDate === todayString;
      const formatted = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      return isToday ? `Today, ${formatted}` : formatted;
    } catch {
      return selectedDate;
    }
  }, [selectedDate, todayString]);

  const handleEventFormSubmit = async (data: EventFormData) => {
    try {
      if (eventForm?.mode === 'create') {
        await createEvent({
          title: data.title,
          description: data.description,
          eventDate: data.eventDate,
          startTime: data.startTime,
          endTime: data.endTime,
          category: data.category,
          color: data.color,
          isAllDay: data.isAllDay,
        });
        toast.success({ message: 'Event scheduled' });
      } else if (eventForm?.mode === 'edit') {
        await updateEvent({
          id: eventForm.event.id,
          title: data.title,
          description: data.description,
          eventDate: data.eventDate,
          startTime: data.startTime,
          endTime: data.endTime,
          category: data.category,
          color: data.color,
          isAllDay: data.isAllDay,
        });
        toast.success({ message: 'Event updated' });
      }
      setEventForm(null);
    } catch (error) {
      Alert.alert(
        'Error saving event',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const handleDeleteEventConfirm = async () => {
    if (!eventToDelete) return;
    try {
      await deleteEvent(eventToDelete.id);
      setEventToDelete(null);
      toast.success({ message: 'Event deleted' });
    } catch (error) {
      Alert.alert(
        'Error deleting event',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const handleCreateTaskFromCalendar = async (data: TaskFormData) => {
    try {
      await createTask({
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category,
        dueDate: data.dueDate || selectedDate,
        subtasks: data.subtasks,
      });
      setTaskFormVisible(false);
      toast.success({ message: 'Task added for this day' });
    } catch (error) {
      Alert.alert(
        'Could not add task',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <Text style={styles.headerSubtitle}>Plan & schedule your timeline</Text>
        </View>

        <TouchableOpacity
          onPress={handleJumpToToday}
          style={styles.todayPill}
          activeOpacity={0.7}
        >
          <Text style={styles.todayPillText}>Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Month Navigation & View Mode Switcher */}
        <View style={styles.calendarControlBar}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={18} color={Colors.text} />
            </TouchableOpacity>

            <Text style={styles.monthLabel}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>

            <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={18} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* View Mode Toggle */}
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              onPress={() => setViewMode('month')}
              style={[styles.viewModeButton, viewMode === 'month' && styles.viewModeButtonActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewModeText, viewMode === 'month' && styles.viewModeTextActive]}>
                Month
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setViewMode('week')}
              style={[styles.viewModeButton, viewMode === 'week' && styles.viewModeButtonActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewModeText, viewMode === 'week' && styles.viewModeTextActive]}>
                Week
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Grid / Strip */}
        <View style={styles.calendarSurface}>
          {viewMode === 'month' ? (
            <MonthGrid
              year={currentYear}
              month={currentMonth}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              dotCounts={dotCounts}
            />
          ) : (
            <WeekStrip
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              dotCounts={dotCounts}
            />
          )}
        </View>

        {/* Daily Agenda Section */}
        <View style={styles.agendaSection}>
          <View style={styles.agendaHeader}>
            <View>
              <Text style={styles.agendaTitle}>{formattedSelectedDate}</Text>
              <Text style={styles.agendaSubtitle}>
                {totalAgendaItems} {totalAgendaItems === 1 ? 'item' : 'items'} scheduled
              </Text>
            </View>

            <View style={styles.agendaActions}>
              <TouchableOpacity
                onPress={() => setEventForm({ mode: 'create', defaultDate: selectedDate })}
                style={styles.addEventButton}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color={Colors.white} />
                <Text style={styles.addEventButtonText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : totalAgendaItems === 0 ? (
            <View style={styles.emptyAgenda}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="calendar-outline" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.emptyAgendaTitle}>Nothing scheduled</Text>
              <Text style={styles.emptyAgendaText}>
                No events or tasks due on this day. Tap below to schedule something.
              </Text>
              <View style={styles.emptyButtonRow}>
                <Button
                  title="+ New Event"
                  variant="primary"
                  size="sm"
                  onPress={() => setEventForm({ mode: 'create', defaultDate: selectedDate })}
                />
                <Button
                  title="+ Task for today"
                  variant="outline"
                  size="sm"
                  onPress={() => setTaskFormVisible(true)}
                />
              </View>
            </View>
          ) : (
            <View style={styles.agendaList}>
              {/* Events List */}
              {dayEvents.map((ev) => (
                <AgendaEventCard
                  key={ev.id}
                  event={ev}
                  onEdit={(item) => setEventForm({ mode: 'edit', event: item })}
                  onDelete={(item) => setEventToDelete(item)}
                />
              ))}

              {/* Due Tasks List */}
              {dayTasks.map((t) => (
                <AgendaTaskCard
                  key={t.id}
                  task={t}
                  onToggle={toggleTask}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Event Form Modal */}
      <EventFormModal
        visible={eventForm !== null}
        mode={eventForm?.mode ?? 'create'}
        defaultDate={eventForm && eventForm.mode === 'create' ? eventForm.defaultDate || selectedDate : selectedDate}
        initialTitle={eventForm?.mode === 'edit' ? eventForm.event.title : ''}
        initialDescription={eventForm?.mode === 'edit' ? eventForm.event.description : ''}
        initialEventDate={eventForm?.mode === 'edit' ? eventForm.event.eventDate : selectedDate}
        initialStartTime={eventForm?.mode === 'edit' ? eventForm.event.startTime : '09:00 AM'}
        initialEndTime={eventForm?.mode === 'edit' ? eventForm.event.endTime : '10:00 AM'}
        initialCategory={eventForm?.mode === 'edit' ? eventForm.event.category : 'general'}
        initialColor={eventForm?.mode === 'edit' ? eventForm.event.color : '#7C3AED'}
        initialIsAllDay={eventForm?.mode === 'edit' ? eventForm.event.isAllDay : false}
        loading={eventsSaving}
        onClose={() => setEventForm(null)}
        onSubmit={handleEventFormSubmit}
      />

      {/* Task Form Modal */}
      <TaskFormModal
        visible={taskFormVisible}
        mode="create"
        initialDueDate={selectedDate}
        onClose={() => setTaskFormVisible(false)}
        onSubmit={handleCreateTaskFromCalendar}
      />

      {/* Delete Event Confirm Modal */}
      <ConfirmModal
        visible={eventToDelete !== null}
        title="Delete event?"
        message={
          eventToDelete ? `"${eventToDelete.title}" will be removed from your calendar.` : ''
        }
        confirmLabel="Delete"
        destructive
        loading={eventsSaving}
        onCancel={() => setEventToDelete(null)}
        onConfirm={() => void handleDeleteEventConfirm()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    marginRight: Spacing.sm,
    padding: Spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  todayPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  todayPillText: {
    ...Typography.captionBold,
    color: Colors.primary,
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  calendarControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  monthArrow: {
    padding: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
  },
  monthLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 16,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  viewModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  viewModeButtonActive: {
    backgroundColor: Colors.white,
    elevation: 1,
  },
  viewModeText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
    fontSize: 11,
  },
  viewModeTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  calendarSurface: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.lg,
  },
  agendaSection: {
    marginTop: Spacing.xs,
  },
  agendaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  agendaTitle: {
    ...Typography.title,
    color: Colors.text,
    fontWeight: '700',
  },
  agendaSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  agendaActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  addEventButtonText: {
    ...Typography.captionBold,
    color: Colors.white,
    fontSize: 12,
  },
  agendaList: {
    gap: 0,
  },
  stateContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyAgenda: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyAgendaTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 16,
    marginBottom: 4,
  },
  emptyAgendaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    maxWidth: 240,
  },
  emptyButtonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
