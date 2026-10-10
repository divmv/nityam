import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from '../styles';

export default function MeditationScreen(props) {
  const { isTabletLayout, sessionMinutes, setSessionMinutes, setSecondsRemaining, setChantCount, sessionEndedEarly, setSessionEndedEarly, sessionStartedRef, sessionLoggedRef, isMeditating, secondsRemaining, setIsMeditating, recordSession, chantCount, sessionLogs, sessionLogError, sessionLogReady } = props;
  return (
<View style={[styles.meditationPage, isTabletLayout && styles.tabletMeditationPage]}>
            <View style={styles.meditationIntro}>
              <Text style={styles.sectionEyebrow}>A MOMENT FOR YOURSELF</Text>
              <Text style={styles.meditationTitle}>Meditation</Text>
              <Text style={styles.meditationSubtitle}>Settle in, breathe gently, and repeat the mantra at your own pace.</Text>
            </View>

            <View style={styles.meditationCard}>
              <Text style={styles.mantraEyebrow}>GĀYATRĪ MANTRA</Text>
              <View style={styles.mantraDivider} />
              <Text style={styles.mantraOm}>Om</Text>
              <Text style={styles.mantraLine}>Bhur Bhuvaḥ Suvaha</Text>
              <Text style={styles.mantraLine}>Tat-savitur Vareñyaṃ</Text>
              <Text style={styles.mantraLine}>Bhargo Devasya Dheemahi</Text>
              <Text style={styles.mantraLine}>Dhiyo Yonaḥ Prachodayā</Text>

              <View style={styles.meditationDivider} />
              <Text style={styles.timerLabel}>SESSION LENGTH</Text>
              <View style={styles.durationOptions}>
                {[5, 10, 15].map((minutes) => (
                  <TouchableOpacity
                    key={minutes}
                    disabled={isMeditating}
                    style={[styles.durationOption, sessionMinutes === minutes && styles.activeDurationOption, isMeditating && styles.disabledOption]}
                    onPress={() => {
                      setSessionMinutes(minutes);
                      setSecondsRemaining(minutes * 60);
                      setChantCount(0);
                      setSessionEndedEarly(false);
                      sessionStartedRef.current = false;
                      sessionLoggedRef.current = false;
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.durationText, sessionMinutes === minutes && styles.activeDurationText]}>{minutes} min</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.timerDisplay}>
                {String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:{String(secondsRemaining % 60).padStart(2, '0')}
              </Text>
              <Text style={styles.timerHint}>
                {isMeditating
                  ? 'Take your time with each repetition'
                  : sessionEndedEarly
                    ? 'Session ended. Sit quietly for a moment.'
                    : secondsRemaining === 0
                      ? 'Session complete. Sit quietly for a moment.'
                      : 'Whenever you are ready'}
              </Text>

              <TouchableOpacity
                style={styles.startButton}
                onPress={() => {
                  if (secondsRemaining === 0 || secondsRemaining === sessionMinutes * 60) {
                    sessionStartedRef.current = true;
                    sessionLoggedRef.current = false;
                    setSessionEndedEarly(false);
                    setSecondsRemaining(sessionMinutes * 60);
                    setChantCount(0);
                  }
                  setIsMeditating((running) => !running);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.startButtonText}>{isMeditating ? 'Pause session' : secondsRemaining === 0 ? 'Begin again' : secondsRemaining < sessionMinutes * 60 ? 'Resume session' : 'Begin session'}</Text>
              </TouchableOpacity>

              {secondsRemaining > 0 && secondsRemaining < sessionMinutes * 60 && (
                <TouchableOpacity
                  style={styles.endSessionButton}
                  onPress={() => {
                    recordSession('Ended early');
                    setIsMeditating(false);
                    setSecondsRemaining(0);
                    setSessionEndedEarly(true);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.endSessionButtonText}>End session</Text>
                </TouchableOpacity>
              )}

              <View style={styles.chantCountRow}>
                <View>
                  <Text style={styles.chantCountValue}>{chantCount}</Text>
                  <Text style={styles.chantCountLabel}>chants completed</Text>
                </View>
                <TouchableOpacity style={styles.chantButton} onPress={() => setChantCount((count) => count + 1)} activeOpacity={0.8}>
                  <Text style={styles.chantButtonText}>Count a chant</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.sessionLogCard}>
              <View style={styles.sessionLogHeader}>
                <View>
                  <Text style={styles.sessionLogEyebrow}>YOUR PRACTICE</Text>
                  <Text style={styles.sessionLogTitle}>Session log</Text>
                </View>
                <View style={styles.sessionTotalBadge}>
                  <Text style={styles.sessionTotalValue}>{sessionLogs.length}</Text>
                  <Text style={styles.sessionTotalLabel}>{sessionLogs.length === 1 ? 'session' : 'sessions'}</Text>
                </View>
              </View>
              {sessionLogError ? <Text style={styles.sessionLogError}>{sessionLogError}</Text> : null}
              {!sessionLogReady ? (
                <Text style={styles.sessionLogEmpty}>Loading your saved sessions...</Text>
              ) : sessionLogs.length === 0 ? (
                <Text style={styles.sessionLogEmpty}>Your meditation sessions will appear here.</Text>
              ) : (
                <View style={styles.sessionLogList}>
                  {sessionLogs.map((session) => {
                    const endedAt = new Date(session.endedAt);
                    const elapsedLabel = session.elapsedSeconds < 60
                      ? '<1 min'
                      : `${Math.floor(session.elapsedSeconds / 60)} min`;
                    return (
                      <View key={session.id} style={styles.sessionLogRow}>
                        <View style={styles.sessionLogDateBadge}>
                          <Text style={styles.sessionLogDateDay}>{endedAt.toLocaleDateString(undefined, { day: 'numeric' })}</Text>
                          <Text style={styles.sessionLogDateMonth}>{endedAt.toLocaleDateString(undefined, { month: 'short' })}</Text>
                        </View>
                        <View style={styles.sessionLogDetails}>
                          <Text style={styles.sessionLogDate}>{endedAt.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric' })}</Text>
                          <Text style={styles.sessionLogMeta}>{endedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} · {elapsedLabel} · {session.chantCount} {session.chantCount === 1 ? 'chant' : 'chants'}</Text>
                        </View>
                        <Text style={[styles.sessionResult, session.result === 'Completed' && styles.completedResult]}>{session.result}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
            <Text style={styles.bottomNote}>Let the words set the pace.</Text>
          </View>
  );
}
