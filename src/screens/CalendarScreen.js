import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from '../styles';
import { dateFromKey, toDateKey, formatReminderTime } from '../utils/dates';

export default function CalendarScreen(props) {
  const { isTabletLayout, isWeb, calendarMonth, setCalendarMonth, checkins, selectedDate, setSelectedDate, todayKey, updateCheckin, checkinError, checkinReady, reminderMinutes, reminderEnabled, reminderReady, reminderBusy, reminderError, saveReminder } = props;
const year = calendarMonth.getFullYear();
          const month = calendarMonth.getMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const leadingBlanks = new Date(year, month, 1).getDay();
          const calendarDays = [...Array(leadingBlanks).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
          const selectedCheckin = checkins[selectedDate] || {};
          const selectedDateIsFuture = selectedDate > todayKey;
          const monthDateKeys = Array.from({ length: daysInMonth }, (_, index) => toDateKey(new Date(year, month, index + 1)));
          const monthlyPrayerDays = monthDateKeys.filter((key) => checkins[key]?.morningPrayer).length;
          const monthlyMeditationDays = monthDateKeys.filter((key) => checkins[key]?.meditation).length;
          const hasPractice = (key) => Boolean(checkins[key]?.morningPrayer || checkins[key]?.meditation);
          let streakCursor = dateFromKey(todayKey);
          if (!hasPractice(toDateKey(streakCursor))) streakCursor.setDate(streakCursor.getDate() - 1);
          let currentStreak = 0;
          while (hasPractice(toDateKey(streakCursor))) {
            currentStreak += 1;
            streakCursor.setDate(streakCursor.getDate() - 1);
          }
          const changeReminderTime = (offset) => {
            const nextMinutes = (reminderMinutes + offset + 1440) % 1440;
            saveReminder(reminderEnabled, nextMinutes);
          };
          const previousMonth = () => {
            const nextMonth = new Date(year, month - 1, 1);
            setCalendarMonth(nextMonth);
            setSelectedDate(toDateKey(nextMonth));
          };
          const nextMonth = () => {
            const next = new Date(year, month + 1, 1);
            const current = new Date();
            if (next.getFullYear() < current.getFullYear() || (next.getFullYear() === current.getFullYear() && next.getMonth() <= current.getMonth())) {
              setCalendarMonth(next);
              setSelectedDate(toDateKey(next));
            }
          };
          return (
            <View style={[styles.calendarPage, isTabletLayout && styles.tabletCalendarPage]}>
              <View style={styles.calendarIntro}>
                <Text style={styles.sectionEyebrow}>YOUR DAILY PRACTICE</Text>
                <Text style={styles.meditationTitle}>Calendar</Text>
                <Text style={styles.meditationSubtitle}>Mark the days you prayed and meditated.</Text>
              </View>
              <View style={styles.calendarCard}>
                <View style={styles.calendarMonthHeader}>
                  <TouchableOpacity accessibilityLabel="Previous month" style={styles.calendarNavButton} onPress={previousMonth}>
                    <Text style={styles.calendarNavText}>‹</Text>
                  </TouchableOpacity>
                  <Text style={styles.calendarMonthLabel}>{calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Text>
                  <TouchableOpacity accessibilityLabel="Next month" style={styles.calendarNavButton} onPress={nextMonth}>
                    <Text style={[styles.calendarNavText, toDateKey(new Date(year, month + 1, 1)) > todayKey.slice(0, 7) + '-01' && styles.disabledCalendarText]}>›</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.weekdaysRow}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <Text key={`${day}-${index}`} style={styles.weekdayLabel}>{day}</Text>)}
                </View>
                <View style={styles.calendarGrid}>
                  {calendarDays.map((day, index) => {
                    if (!day) return <View key={`blank-${index}`} style={styles.calendarDayCell} />;
                    const dayKey = toDateKey(new Date(year, month, day));
                    const dayCheckin = checkins[dayKey] || {};
                    const isFuture = dayKey > todayKey;
                    const isToday = dayKey === todayKey;
                    const isSelected = dayKey === selectedDate;
                    return (
                      <View key={dayKey} style={styles.calendarDayCell}>
                        <TouchableOpacity
                          disabled={isFuture}
                          style={[styles.calendarDayButton, isToday && styles.todayCalendarDay, isSelected && styles.selectedCalendarDay, isFuture && styles.disabledCalendarDay]}
                          onPress={() => setSelectedDate(dayKey)}
                          accessibilityLabel={`${calendarMonth.toLocaleDateString(undefined, { month: 'long' })} ${day}${isFuture ? ', unavailable' : ''}`}
                        >
                          <Text style={[styles.calendarDayNumber, isSelected && styles.selectedCalendarDayNumber, isFuture && styles.disabledCalendarText]}>{day}</Text>
                          <View style={styles.dayIndicators}>
                            <View style={[styles.calendarDot, dayCheckin.morningPrayer && styles.prayerDotDone]} />
                            <View style={[styles.calendarDot, dayCheckin.meditation && styles.meditationDotDone]} />
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
                <View style={styles.calendarLegend}>
                  <View style={styles.legendItem}><View style={[styles.calendarDot, styles.prayerDotDone]} /><Text style={styles.legendText}>Morning prayer</Text></View>
                  <View style={styles.legendItem}><View style={[styles.calendarDot, styles.meditationDotDone]} /><Text style={styles.legendText}>Meditation</Text></View>
                </View>
              </View>
              <View style={styles.monthlySummaryCard}>
                <Text style={styles.monthlySummaryEyebrow}>{calendarMonth.toLocaleDateString(undefined, { month: 'long' }).toUpperCase()} TOTALS</Text>
                <View style={styles.monthlyStatsRow}>
                  <View style={styles.monthlyStat}>
                    <Text style={styles.monthlyStatValue}>{currentStreak}</Text>
                    <Text style={styles.monthlyStatLabel}>day streak</Text>
                  </View>
                  <View style={styles.monthlyStatDivider} />
                  <View style={styles.monthlyStat}>
                    <Text style={styles.monthlyStatValue}>{monthlyPrayerDays}</Text>
                    <Text style={styles.monthlyStatLabel}>prayer days</Text>
                  </View>
                  <View style={styles.monthlyStatDivider} />
                  <View style={styles.monthlyStat}>
                    <Text style={styles.monthlyStatValue}>{monthlyMeditationDays}</Text>
                    <Text style={styles.monthlyStatLabel}>meditation days</Text>
                  </View>
                </View>
              </View>
              {isWeb ? (
                <View style={styles.reminderCard}>
                  <Text style={styles.reminderEyebrow}>DAILY PRAYER</Text>
                  <Text style={styles.reminderTitle}>Prayer reminders</Text>
                  <Text style={styles.reminderDescription}>Scheduled reminders are unavailable in this Home Screen web app. Your prayer check-ins and meditation logs are saved on this device.</Text>
                </View>
              ) : (
              <View style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderCopy}>
                    <Text style={styles.reminderEyebrow}>DAILY PRAYER</Text>
                    <Text style={styles.reminderTitle}>Prayer reminder</Text>
                    <Text style={styles.reminderDescription}>A gentle notification at your chosen time.</Text>
                  </View>
                  <TouchableOpacity
                    disabled={!reminderReady || reminderBusy}
                    style={[styles.reminderToggle, reminderEnabled && styles.reminderToggleOn, (!reminderReady || reminderBusy) && styles.disabledCheckinRow]}
                    onPress={() => saveReminder(!reminderEnabled, reminderMinutes)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.reminderToggleText, reminderEnabled && styles.reminderToggleTextOn]}>{reminderEnabled ? 'On' : 'Off'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.reminderTimeRow}>
                  <Text style={styles.reminderTimeLabel}>Reminder time</Text>
                  <View style={styles.reminderTimeControl}>
                    <TouchableOpacity
                      accessibilityLabel="Earlier reminder time"
                      disabled={!reminderReady || reminderBusy}
                      style={styles.reminderTimeButton}
                      onPress={() => changeReminderTime(-15)}
                    ><Text style={styles.reminderTimeButtonText}>−</Text></TouchableOpacity>
                    <Text style={styles.reminderTimeValue}>{formatReminderTime(reminderMinutes)}</Text>
                    <TouchableOpacity
                      accessibilityLabel="Later reminder time"
                      disabled={!reminderReady || reminderBusy}
                      style={styles.reminderTimeButton}
                      onPress={() => changeReminderTime(15)}
                    ><Text style={styles.reminderTimeButtonText}>+</Text></TouchableOpacity>
                  </View>
                </View>
                {reminderError ? <Text style={styles.reminderError}>{reminderError}</Text> : null}
                <Text style={styles.reminderNote}>{reminderEnabled ? 'Repeats every day. Tap the time buttons to adjust in 15 minute steps.' : 'Choose a time, then turn the reminder on.'}</Text>
              </View>
              )}
              <View style={styles.checkinCard}>
                <View style={styles.checkinCardHeader}>
                  <View>
                    <Text style={styles.checkinEyebrow}>DAILY CHECK-IN</Text>
                    <Text style={styles.checkinDate}>{dateFromKey(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                  </View>
                  <Text style={styles.checkinProgress}>{Number(Boolean(selectedCheckin.morningPrayer)) + Number(Boolean(selectedCheckin.meditation))} / 2</Text>
                </View>
                {checkinError ? <Text style={styles.calendarError}>{checkinError}</Text> : null}
                {!checkinReady ? <Text style={styles.legendText}>Loading saved check-ins…</Text> : null}
                {[
                  { key: 'morningPrayer', title: 'Morning prayer', subtitle: 'I spent time in prayer today' },
                  { key: 'meditation', title: 'Meditation session', subtitle: 'I sat for a meditation session' },
                ].map((item) => {
                  const isDone = Boolean(selectedCheckin[item.key]);
                  return (
                    <TouchableOpacity
                      key={item.key}
                      disabled={selectedDateIsFuture || !checkinReady}
                      style={[styles.checkinRow, isDone && styles.completedCheckinRow, selectedDateIsFuture && styles.disabledCheckinRow]}
                      onPress={() => updateCheckin(selectedDate, item.key, !isDone)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.checkinCopy}>
                        <Text style={styles.checkinTitle}>{item.title}</Text>
                        <Text style={styles.checkinSubtitle}>{item.subtitle}</Text>
                      </View>
                      <View style={[styles.checkinToggle, isDone && styles.checkinToggleDone]}>
                        <Text style={[styles.checkinToggleText, isDone && styles.checkinToggleTextDone]}>{isDone ? '✓' : '+'}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.bottomNote}>Small moments, remembered.</Text>
            </View>
          );
}
