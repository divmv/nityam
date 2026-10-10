import React from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import styles from '../styles';

export default function LibraryScreen(props) {
  const { isTabletLayout, categories, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, filteredSongs, selectedSong, setSelectedSong, setFontSize, fontSize } = props;
  return (
<>
            <View style={[styles.contentRow, isTabletLayout && styles.tabletContentRow]}>
        <View style={[styles.librarySection, isTabletLayout && styles.tabletLibrarySection]}>
          <Text style={styles.sectionEyebrow}>YOUR COLLECTION</Text>
          <Text style={styles.sectionTitle}>Find a prayer</Text>
          <View style={styles.searchWrap}>
            <Text style={styles.searchGlyph}>⌕</Text>
            <TextInput
              style={styles.searchBar}
              placeholder="Search titles or lyrics"
              placeholderTextColor="#9A978E"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.chip, selectedCategory === category && styles.activeChip]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, selectedCategory === category && styles.activeChipText]}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.listHeading}>
            <Text style={styles.listHeadingText}>PRAYERS</Text>
            <Text style={styles.resultCount}>{filteredSongs.length} titles</Text>
          </View>
          {filteredSongs.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.songList}>
              {filteredSongs.map((song, index) => {
                const isSelected = selectedSong?.id === song.id;
                return (
                  <TouchableOpacity
                    key={song.id}
                    style={[styles.songCard, isSelected && styles.activeSongCard]}
                    onPress={() => setSelectedSong((current) => current?.id === song.id ? null : song)}
                    accessibilityLabel={`${song.title}${isSelected ? ', selected. Tap to deselect.' : ''}`}
                    accessibilityState={{ selected: isSelected }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.songNumber, isSelected && styles.activeSongNumber]}>
                      <Text style={[styles.songNumberText, isSelected && styles.activeSongNumberText]}>{String(index + 1).padStart(2, '0')}</Text>
                    </View>
                    <Text style={[styles.songTitle, isSelected && styles.activeSongTitle]} numberOfLines={2}>{song.title}</Text>
                    <Text style={[styles.songCategory, isSelected && styles.activeSongCategory]} numberOfLines={1}>{song.category}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.noResults}><Text style={styles.noResultsText}>No prayers found. Try another search.</Text></View>
          )}
        </View>

        {selectedSong ? (
          <View style={[styles.readerCard, isTabletLayout && styles.tabletReaderCard]}>
            <View style={styles.readerHeader}>
              <View style={styles.readerHeading}>
                <Text style={styles.readerCategory}>{selectedSong.category}</Text>
                <Text style={styles.readerTitle}>{selectedSong.title}</Text>
              </View>
              <View style={styles.fontControls}>
                <TouchableOpacity
                  accessibilityLabel="Deselect prayer"
                  style={styles.clearSelectionButton}
                  onPress={() => setSelectedSong(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearSelectionText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel="Decrease lyrics text size"
                  style={styles.fontBtn}
                  onPress={() => setFontSize((size) => Math.max(16, size - 2))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.fontBtnText}>A-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel="Increase lyrics text size"
                  style={styles.fontBtn}
                  onPress={() => setFontSize((size) => Math.min(36, size + 2))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.fontBtnText}>A+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.readerAccent} />
            <Text style={[styles.lyricsText, { fontSize, lineHeight: fontSize * 1.75 }]}>{selectedSong.lyrics}</Text>
            <View style={styles.readerFooter}>
              <View style={styles.footerDot} />
              <Text style={styles.footerText}>READ AT YOUR OWN PACE</Text>
              <View style={styles.footerDot} />
            </View>
          </View>
        ) : (
          <View style={[styles.emptyState, isTabletLayout && styles.tabletEmptyState]}>
            <Text style={styles.emptyMark}>ॐ</Text>
            <Text style={styles.emptyText}>Select a prayer to begin reading.</Text>
          </View>
        )}
        </View>
        <Text style={styles.bottomNote}>Made for moments of stillness</Text>
          </>
  );
}
