import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView, useWindowDimensions, Vibration, Platform } from 'react-native';
import LibraryScreen from './src/screens/LibraryScreen';
import MeditationScreen from './src/screens/MeditationScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import styles from './src/styles';
import { toDateKey } from './src/utils/dates';
import songsData from './songs.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const SESSION_LOG_KEY = 'stotra.meditation.sessions.v1';
const CHECKIN_LOG_KEY = 'stotra.daily.checkins.v1';
const REMINDER_KEY = 'stotra.daily.reminder.v1';
const REMINDER_NOTIFICATION_ID_KEY = 'stotra.daily.reminder.notificationId.v1';
const REMINDER_CHANNEL_ID = 'daily-practice-reminders';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export default function App() {
  const { width } = useWindowDimensions();
  const isTabletLayout = width >= 760;
  const [activeSection, setActiveSection] = useState('library');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const orderedSongs = useMemo(() => {
    const hanumanChalisa = songsData.find((song) => song.title === 'Hanuman Chalisa');
    return hanumanChalisa
      ? [hanumanChalisa, ...songsData.filter((song) => song.id !== hanumanChalisa.id)]
      : songsData;
  }, []);
  const [selectedSong, setSelectedSong] = useState(null);
  const [fontSize, setFontSize] = useState(22);
  const [sessionMinutes, setSessionMinutes] = useState(5);
  const [secondsRemaining, setSecondsRemaining] = useState(5 * 60);
  const [isMeditating, setIsMeditating] = useState(false);
  const [chantCount, setChantCount] = useState(0);
  const [sessionEndedEarly, setSessionEndedEarly] = useState(false);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [sessionLogReady, setSessionLogReady] = useState(false);
  const [sessionLogError, setSessionLogError] = useState('');
  const [checkins, setCheckins] = useState({});
  const [checkinReady, setCheckinReady] = useState(false);
  const [checkinError, setCheckinError] = useState('');
  const checkinsRef = useRef({});
  const [todayKey] = useState(() => toDateKey(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [reminderMinutes, setReminderMinutes] = useState(7 * 60);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderReady, setReminderReady] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);
  const [reminderError, setReminderError] = useState('');
  const sessionLogsRef = useRef([]);
  const sessionStartedRef = useRef(false);
  const sessionLoggedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const loadCheckins = async () => {
      try {
        const storedCheckins = await AsyncStorage.getItem(CHECKIN_LOG_KEY);
        const parsedCheckins = storedCheckins ? JSON.parse(storedCheckins) : {};
        if (isMounted && parsedCheckins && typeof parsedCheckins === 'object' && !Array.isArray(parsedCheckins)) {
          checkinsRef.current = parsedCheckins;
          setCheckins(parsedCheckins);
        }
      } catch {
        if (isMounted) setCheckinError('Could not load your saved calendar check-ins.');
      } finally {
        if (isMounted) setCheckinReady(true);
      }
    };
    loadCheckins();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadReminder = async () => {
      try {
        const stored = await AsyncStorage.getItem(REMINDER_KEY);
        if (isMounted && stored) {
          const parsed = JSON.parse(stored);
          if (Number.isInteger(parsed.minutes) && parsed.minutes >= 0 && parsed.minutes < 1440) setReminderMinutes(parsed.minutes);
          if (typeof parsed.enabled === 'boolean') setReminderEnabled(parsed.enabled);
        }
      } catch {
        if (isMounted) setReminderError('Could not load your reminder settings.');
      } finally {
        if (isMounted) setReminderReady(true);
      }
    };
    loadReminder();
    return () => { isMounted = false; };
  }, []);

  const saveReminder = useCallback(async (enabled, minutes) => {
    if (Platform.OS === 'web') {
      setReminderEnabled(false);
      setReminderError('Prayer reminders are not supported in this web app.');
      return;
    }
    setReminderBusy(true);
    setReminderError('');
    try {
      const oldNotificationId = await AsyncStorage.getItem(REMINDER_NOTIFICATION_ID_KEY);
      if (oldNotificationId) await Notifications.cancelScheduledNotificationAsync(oldNotificationId);

      if (enabled) {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
            name: 'Daily prayer reminder',
            importance: Notifications.AndroidImportance.DEFAULT,
            sound: 'default',
          });
        }
        let permission = await Notifications.getPermissionsAsync();
        if (!permission.granted && permission.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) {
          permission = await Notifications.requestPermissionsAsync();
        }
        if (!permission.granted && permission.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) {
          setReminderEnabled(false);
          await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify({ enabled: false, minutes }));
          setReminderError('Allow notifications in your device settings to turn on reminders.');
          return;
        }
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Time for morning prayer',
            body: 'Take a quiet moment for your daily practice.',
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            ...(Platform.OS === 'android' ? { channelId: REMINDER_CHANNEL_ID } : {}),
          },
        });
        await AsyncStorage.setItem(REMINDER_NOTIFICATION_ID_KEY, notificationId);
      } else {
        await AsyncStorage.removeItem(REMINDER_NOTIFICATION_ID_KEY);
      }
      await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify({ enabled, minutes }));
      setReminderEnabled(enabled);
      setReminderMinutes(minutes);
    } catch {
      setReminderError('Could not update your reminder. Please try again.');
    } finally {
      setReminderBusy(false);
    }
  }, []);

  const updateCheckin = useCallback((dateKey, field, value) => {
    const updatedCheckins = {
      ...checkinsRef.current,
      [dateKey]: { ...(checkinsRef.current[dateKey] || {}), [field]: value },
    };
    checkinsRef.current = updatedCheckins;
    setCheckins(updatedCheckins);
    AsyncStorage.setItem(CHECKIN_LOG_KEY, JSON.stringify(updatedCheckins))
      .then(() => setCheckinError(''))
      .catch(() => setCheckinError('This check-in could not be saved on this device.'));
  }, []);


  useEffect(() => {
    let isMounted = true;

    const loadSessionLogs = async () => {
      try {
        const storedLogs = await AsyncStorage.getItem(SESSION_LOG_KEY);
        const parsedLogs = storedLogs ? JSON.parse(storedLogs) : [];
        if (isMounted && Array.isArray(parsedLogs)) {
          sessionLogsRef.current = parsedLogs;
          setSessionLogs(parsedLogs);
        }
      } catch {
        if (isMounted) setSessionLogError('Could not load your saved session log.');
      } finally {
        if (isMounted) setSessionLogReady(true);
      }
    };

    loadSessionLogs();
    return () => {
      isMounted = false;
    };
  }, []);

  const recordSession = useCallback(async (result) => {
    if (!sessionStartedRef.current || sessionLoggedRef.current) return;

    sessionLoggedRef.current = true;
    const elapsedSeconds = Math.max(0, sessionMinutes * 60 - secondsRemaining);
    const session = {
      id: `${Date.now()}`,
      endedAt: new Date().toISOString(),
      elapsedSeconds,
      chantCount,
      result,
    };
    const updatedLogs = [session, ...sessionLogsRef.current];
    sessionLogsRef.current = updatedLogs;
    setSessionLogs(updatedLogs);
    updateCheckin(toDateKey(new Date()), 'meditation', true);

    try {
      await AsyncStorage.setItem(SESSION_LOG_KEY, JSON.stringify(updatedLogs));
      setSessionLogError('');
    } catch {
      setSessionLogError('This session could not be saved on this device.');
    }
  }, [chantCount, secondsRemaining, sessionMinutes, updateCheckin]);
  useEffect(() => {
    if (!isMeditating) return undefined;

    const intervalId = setInterval(() => {
      setSecondsRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isMeditating]);

  useEffect(() => {
    if (isMeditating && secondsRemaining === 0) {
      if (Platform.OS !== 'web') Vibration.vibrate();
      recordSession('Completed');
      setIsMeditating(false);
    }
  }, [isMeditating, secondsRemaining, recordSession]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(songsData.map((item) => item.category));
    return ['All', ...Array.from(uniqueCategories)];
  }, []);

  const filteredSongs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orderedSongs.filter((song) => {
      const matchesCategory = selectedCategory === 'All' || song.category === selectedCategory;
      const matchesSearch = !query || song.title.toLowerCase().includes(query) || song.lyrics.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [orderedSongs, selectedCategory, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.omBadge}>
              <Text style={styles.omText}>ॐ</Text>
            </View>
            <Text style={styles.libraryCount}>{songsData.length} PRAYERS</Text>
          </View>
          <Text style={styles.appTitle}>Nityam</Text>
          <Text style={styles.subtitle}>A quiet place for sacred words.</Text>
          <View style={styles.heroRule} />
        </View>

        <View style={styles.modeTabs}>
          <TouchableOpacity style={[styles.modeTab, activeSection === 'library' && styles.activeModeTab]} onPress={() => setActiveSection('library')} activeOpacity={0.8}>
            <Text style={[styles.modeTabText, activeSection === 'library' && styles.activeModeTabText]}>Library</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeTab, activeSection === 'meditate' && styles.activeModeTab]} onPress={() => setActiveSection('meditate')} activeOpacity={0.8}>
            <Text style={[styles.modeTabText, activeSection === 'meditate' && styles.activeModeTabText]}>Meditate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeTab, activeSection === 'calendar' && styles.activeModeTab]} onPress={() => setActiveSection('calendar')} activeOpacity={0.8}>
            <Text style={[styles.modeTabText, activeSection === 'calendar' && styles.activeModeTabText]}>Calendar</Text>
          </TouchableOpacity>
        </View>

        {activeSection === 'library' ? (
          <LibraryScreen {...{ isTabletLayout, categories, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, filteredSongs, selectedSong, setSelectedSong, setFontSize, fontSize }} />
        ) : activeSection === 'meditate' ? (
          <MeditationScreen {...{ isTabletLayout, sessionMinutes, setSessionMinutes, setSecondsRemaining, setChantCount, sessionEndedEarly, setSessionEndedEarly, sessionStartedRef, sessionLoggedRef, isMeditating, secondsRemaining, setIsMeditating, recordSession, chantCount, sessionLogs, sessionLogError, sessionLogReady }} />
        ) : (
          <CalendarScreen {...{ isTabletLayout, isWeb: Platform.OS === 'web', calendarMonth, setCalendarMonth, checkins, selectedDate, setSelectedDate, todayKey, updateCheckin, checkinError, checkinReady, reminderMinutes, reminderEnabled, reminderReady, reminderBusy, reminderError, saveReminder }} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
