import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput } from 'react-native';
import styles from '../styles';

const angerLevels = [
  { value: 1, label: 'A little' },
  { value: 2, label: 'Some' },
  { value: 3, label: 'Strong' },
  { value: 4, label: 'Very strong' },
  { value: 5, label: 'Overwhelming' },
];

const responseOptions = [
  'I paused before responding',
  'I stepped away to cool down',
  'I expressed what I needed calmly',
  'I reacted quickly; I can repair',
  'I am still deciding',
];

function formatMoment(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Saved reflection';
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ReflectionScreen(props) {
  const { isTabletLayout, reflections, reflectionsReady, reflectionError, saveReflection, deleteReflection } = props;
  const [pauseSeconds, setPauseSeconds] = useState(30);
  const [pauseStarted, setPauseStarted] = useState(false);
  const pauseActive = pauseStarted && pauseSeconds > 0;
  const [angerLevel, setAngerLevel] = useState(3);
  const [situation, setSituation] = useState('');
  const [response, setResponse] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const levelLabel = useMemo(() => angerLevels.find((level) => level.value === angerLevel)?.label, [angerLevel]);

  useEffect(() => {
    if (!pauseActive) return undefined;
    const intervalId = setInterval(() => {
      setPauseSeconds((seconds) => {
        return Math.max(0, seconds - 1);
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [pauseActive]);

  const startPause = () => {
    setPauseSeconds(30);
    setPauseStarted(true);
  };

  const stopPause = () => {
    setPauseStarted(false);
    setPauseSeconds(30);
  };

  const saveMoment = async () => {
    setIsSaving(true);
    const saved = await saveReflection({
      id: `${Date.now()}`,
      occurredAt: new Date().toISOString(),
      angerLevel,
      situation: situation.trim(),
      response,
    });
    setIsSaving(false);
    if (saved) {
      setSituation('');
      setResponse('');
      setAngerLevel(3);
    }
  };

  const secondsElapsed = 30 - pauseSeconds;
  const breathingIn = secondsElapsed % 10 < 4;

  return (
    <View style={[styles.reflectionPage, isTabletLayout && styles.tabletReflectionPage]}>
      <View style={styles.reflectionIntro}>
        <Text style={styles.sectionEyebrow}>SELF-AWARENESS</Text>
        <Text style={styles.meditationTitle}>Pause &amp; Reflect</Text>
        <Text style={styles.meditationSubtitle}>Notice what you feel, then choose how you want to respond. Every moment is a chance to practice.</Text>
      </View>

      <View style={styles.reflectionPauseCard}>
        <Text style={styles.reflectionEyebrow}>A RESET IN THE MOMENT</Text>
        <Text style={styles.reflectionCardTitle}>Give yourself a little space</Text>
        <Text style={styles.reflectionBody}>Unclench your jaw. Let your shoulders soften. You do not have to answer right away.</Text>
        {pauseActive ? (
          <View style={styles.pauseActiveArea}>
            <View style={styles.pauseTimerCircle}>
              <Text style={styles.pauseTimerValue}>{pauseSeconds}</Text>
              <Text style={styles.pauseTimerUnit}>SECONDS</Text>
            </View>
            <Text accessibilityLiveRegion="polite" style={styles.breathingCue}>{breathingIn ? 'Breathe in gently' : 'Breathe out slowly'}</Text>
            <Text style={styles.reflectionBody}>Breathe in for 4, out for 6. Follow a comfortable pace; there is no need to force it.</Text>
            <TouchableOpacity accessibilityRole="button" style={styles.pauseStopButton} onPress={stopPause} activeOpacity={0.75}>
              <Text style={styles.pauseStopButtonText}>End pause</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity accessibilityRole="button" style={styles.pauseStartButton} onPress={startPause} activeOpacity={0.8}>
            <Text style={styles.pauseStartButtonText}>{pauseSeconds === 0 ? 'Take another pause' : 'Start a 30-second pause'}</Text>
          </TouchableOpacity>
        )}
        {!pauseActive && <Text style={styles.pausePrompt}>Ask yourself: “What outcome do I want from what I say next?”</Text>}
      </View>

      <View style={styles.reflectionFormCard}>
        <Text style={styles.reflectionEyebrow}>PERSONAL JOURNAL</Text>
        <Text style={styles.reflectionCardTitle}>Log a moment of anger</Text>
        <Text style={styles.reflectionBody}>This is for noticing patterns, not judging yourself. You can keep the details brief.</Text>

        <Text style={styles.reflectionFieldLabel}>How strong did it feel?</Text>
        <View style={styles.angerScaleRow}>
          {angerLevels.map((level) => (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Anger level ${level.value}: ${level.label}`}
              accessibilityState={{ selected: angerLevel === level.value }}
              key={level.value}
              style={[styles.angerScaleButton, angerLevel === level.value && styles.angerScaleButtonSelected]}
              onPress={() => setAngerLevel(level.value)}
              activeOpacity={0.75}
            >
              <Text style={[styles.angerScaleNumber, angerLevel === level.value && styles.angerScaleNumberSelected]}>{level.value}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.angerScaleLabels}>
          <Text style={styles.reflectionHint}>A little</Text>
          <Text style={styles.reflectionSelectedLevel}>{levelLabel}</Text>
          <Text style={styles.reflectionHint}>Overwhelming</Text>
        </View>

        <Text style={styles.reflectionFieldLabel}>What was happening? <Text style={styles.reflectionHint}>(optional)</Text></Text>
        <TextInput
          accessibilityLabel="What was happening when you felt angry?"
          style={styles.reflectionInput}
          value={situation}
          onChangeText={setSituation}
          placeholder="A few words about the moment..."
          placeholderTextColor="#9A978E"
          multiline
          maxLength={500}
          textAlignVertical="top"
        />
        <Text style={styles.reflectionFieldLabel}>How did you respond?</Text>
        <View style={styles.responseOptions}>
          {responseOptions.map((option) => {
            const selected = response === option;
            return (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={option}
                style={[styles.responseOption, selected && styles.responseOptionSelected]}
                onPress={() => setResponse(selected ? '' : option)}
                activeOpacity={0.75}
              >
                <Text style={[styles.responseOptionText, selected && styles.responseOptionTextSelected]}>{option}</Text>
                {selected ? <Text style={styles.responseOptionCheck}>✓</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>
        {reflectionError ? <Text accessibilityLiveRegion="polite" style={styles.reflectionError}>{reflectionError}</Text> : null}
        <TouchableOpacity
          accessibilityRole="button"
          disabled={!reflectionsReady || isSaving}
          style={[styles.reflectionSaveButton, (!reflectionsReady || isSaving) && styles.disabledCheckinRow]}
          onPress={saveMoment}
          activeOpacity={0.8}
        >
          <Text style={styles.reflectionSaveButtonText}>{isSaving ? 'Saving…' : 'Save reflection'}</Text>
        </TouchableOpacity>
        <Text style={styles.reflectionPrivacyNote}>Your reflections are saved on this device and are not synced to an account.</Text>
      </View>

      <View style={styles.reflectionLogCard}>
        <View style={styles.reflectionLogHeader}>
          <View>
            <Text style={styles.reflectionEyebrow}>YOUR PRACTICE</Text>
            <Text style={styles.reflectionCardTitle}>Recent reflections</Text>
          </View>
          <View style={styles.reflectionCountBadge}>
            <Text style={styles.reflectionCountValue}>{reflections.length}</Text>
            <Text style={styles.reflectionCountLabel}>{reflections.length === 1 ? 'moment' : 'moments'}</Text>
          </View>
        </View>
        {!reflectionsReady ? <Text style={styles.reflectionEmptyText}>Loading saved reflections…</Text> : null}
        {reflectionsReady && reflections.length === 0 ? (
          <Text style={styles.reflectionEmptyText}>Your entries will appear here. Start whenever you are ready; there is no perfect way to do this.</Text>
        ) : null}
        {reflections.slice(0, 20).map((item) => {
          const itemLevel = angerLevels.find((level) => level.value === item.angerLevel);
          return (
            <View key={item.id} style={styles.reflectionLogRow}>
              <View style={styles.reflectionLogTopRow}>
                <Text style={styles.reflectionLogDate}>{formatMoment(item.occurredAt)}</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Delete reflection from ${formatMoment(item.occurredAt)}`}
                  style={styles.reflectionDeleteButton}
                  onPress={() => deleteReflection(item.id)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.reflectionDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.reflectionLogIntensity}>Anger: {itemLevel?.label || 'Not rated'}{item.angerLevel ? ` (${item.angerLevel}/5)` : ''}</Text>
              {item.situation ? <Text style={styles.reflectionLogNote}>{item.situation}</Text> : null}
              {item.response ? <Text style={styles.reflectionLogResponse}>{item.response}</Text> : null}
            </View>
          );
        })}
      </View>
      <Text style={styles.bottomNote}>Change grows one pause at a time.</Text>
    </View>
  );
}
