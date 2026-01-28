import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';
import { usePremium } from '../src/contexts/PremiumContext';
import {
  parseReference,
  getChapter,
  getAllBooks,
  getPreviousChapter,
  getNextChapter,
  getBookChapterCount,
} from '../src/utils/bible';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { ChevronLeft, ChevronRight, Book } from 'react-native-feather';

// Unicode superscript numbers for verse numbers
const SUPERSCRIPT_NUMBERS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵',
  '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};

const convertToSuperscript = (num: number): string => {
  return num.toString().split('').map(digit => SUPERSCRIPT_NUMBERS[digit] || digit).join('');
};

export default function ReadScreen() {
  const params = useLocalSearchParams<{
    bookName: string;
    chapter: string;
    verse: string; // The verse to highlight
  }>();

  const { colors } = useTheme();
  const { isPremium } = usePremium();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize state from params
  const [bookName, setBookName] = useState(() => {
    if (params.bookName) return params.bookName;
    // Try to parse from reference if bookName not provided
    const reference = params.reference as string;
    if (reference) {
      const parsed = parseReference(reference);
      return parsed?.bookName || '';
    }
    return '';
  });
  
  const [chapter, setChapter] = useState(() => {
    if (params.chapter) return parseInt(params.chapter, 10);
    const reference = params.reference as string;
    if (reference) {
      const parsed = parseReference(reference);
      return parsed?.chapter || 1;
    }
    return 1;
  });
  
  // Store original verse/chapter from params - only highlight this specific verse
  const [originalBookName] = useState(() => {
    if (params.bookName) return params.bookName;
    const reference = params.reference as string;
    if (reference) {
      const parsed = parseReference(reference);
      return parsed?.bookName || '';
    }
    return '';
  });
  
  const [originalChapter] = useState(() => {
    if (params.chapter) return parseInt(params.chapter, 10);
    const reference = params.reference as string;
    if (reference) {
      const parsed = parseReference(reference);
      return parsed?.chapter || 0;
    }
    return 0;
  });
  
  const [originalVerse] = useState(() => {
    if (params.verse) return parseInt(params.verse, 10);
    const reference = params.reference as string;
    if (reference) {
      const parsed = parseReference(reference);
      return parsed?.verse || 0;
    }
    return 0;
  });
  
  const [chapterData, setChapterData] = useState<ReturnType<typeof getChapter> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [selectedBookForChapters, setSelectedBookForChapters] = useState<string>('');

  // Load chapter data
  useEffect(() => {
    const loadChapter = () => {
      setLoading(true);
      const data = getChapter(bookName, chapter);
      setChapterData(data);
      setLoading(false);
    };

    if (bookName) {
      loadChapter();
    } else {
      setLoading(false);
    }
  }, [bookName, chapter]);

  // Auto-scroll to highlighted verse when chapter loads (only if it's the original verse)
  useEffect(() => {
    const shouldHighlight = originalBookName === bookName && 
                           originalChapter === chapter && 
                           originalVerse > 0;
    
    if (chapterData && shouldHighlight && scrollViewRef.current) {
      // Calculate approximate position based on verse index
      const verseIndex = chapterData.verses.findIndex(v => v.verse === originalVerse);
      if (verseIndex >= 0) {
        // Estimate: each verse takes ~60-80px on average
        const estimatedY = verseIndex * 70;
        
        // Small delay to ensure layout is complete
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, estimatedY - scaleSpacing(100)), // Offset to show some context above
            animated: true,
          });
        }, 500);
      }
    }
  }, [chapterData, bookName, chapter, originalBookName, originalChapter, originalVerse]);

  const handlePreviousChapter = () => {
    if (!isPremium) {
      router.push('/paywall');
      return;
    }

    const prev = getPreviousChapter(bookName, chapter);
    if (prev) {
      setBookName(prev.bookName);
      setChapter(prev.chapter);
    }
  };

  const handleNextChapter = () => {
    if (!isPremium) {
      router.push('/paywall');
      return;
    }

    const next = getNextChapter(bookName, chapter);
    if (next) {
      setBookName(next.bookName);
      setChapter(next.chapter);
    }
  };

  const handleBookSelect = (selectedBook: string) => {
    if (!isPremium) {
      router.push('/paywall');
      setShowBookPicker(false);
      return;
    }

    // Instead of navigating immediately, show chapter picker for this book
    setSelectedBookForChapters(selectedBook);
    setShowBookPicker(false);
    setShowChapterPicker(true);
  };

  const handleChapterSelect = (selectedChapter: number) => {
    if (!isPremium) {
      router.push('/paywall');
      setShowChapterPicker(false);
      return;
    }

    // Use the selected book (or current book if coming from location button)
    const bookToUse = selectedBookForChapters || bookName;
    setBookName(bookToUse);
    setChapter(selectedChapter);
    setSelectedBookForChapters('');
    setShowChapterPicker(false);
  };

  const canGoPrevious = getPreviousChapter(bookName, chapter) !== null;
  const canGoNext = getNextChapter(bookName, chapter) !== null;
  const allBooks = getAllBooks();
  // Use selected book for chapters if in chapter picker, otherwise current book
  const bookForChapters = selectedBookForChapters || bookName;
  const chapterCount = getBookChapterCount(bookForChapters);
  const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);
  
  // Only highlight if it's the original verse on the original chapter
  const shouldHighlightVerse = (verseNum: number) => {
    return originalBookName === bookName && 
           originalChapter === chapter && 
           originalVerse === verseNum &&
           originalVerse > 0;
  };

  const headerPaddingTop = Math.max(insets.top + scaleSpacing(12), scaleSpacing(40));

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: headerPaddingTop }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backButtonText, { color: colors.darker }]}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.darker }]}>Loading chapter...</Text>
        </View>
      </View>
    );
  }

  if (!chapterData || !bookName) {
    return (
      <View style={[styles.container, { paddingTop: headerPaddingTop }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backButtonText, { color: colors.darker }]}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.darker }]}>
            Could not find chapter. Please check the reference.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: headerPaddingTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backButtonText, { color: colors.darker }]}>← Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => setShowChapterPicker(true)}
          activeOpacity={0.7}
        >
          <View style={styles.locationContainer}>
            <View style={styles.locationRow}>
              <Book width={scaleIconSize(16)} height={scaleIconSize(16)} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.locationText, { color: colors.primary }]}>
                {bookName} {chapter}
              </Text>
            </View>
            <Text style={[styles.locationHint, { color: colors.darker }]}>
              Change chapter
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.navButtons}>
          <TouchableOpacity
            style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
            onPress={handlePreviousChapter}
            disabled={!canGoPrevious}
            activeOpacity={0.7}
          >
            <ChevronLeft
              width={scaleIconSize(20)}
              height={scaleIconSize(20)}
              color={canGoPrevious ? colors.darker : '#ccc'}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
            onPress={handleNextChapter}
            disabled={!canGoNext}
            activeOpacity={0.7}
          >
            <ChevronRight
              width={scaleIconSize(20)}
              height={scaleIconSize(20)}
              color={canGoNext ? colors.darker : '#ccc'}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chapter Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {chapterData.verses.map((verse) => {
            const isHighlighted = shouldHighlightVerse(verse.verse);
            return (
              <View
                key={verse.verse}
                style={[
                  styles.verseContainer,
                  isHighlighted && [
                    styles.verseHighlighted,
                    { backgroundColor: `${colors.primary}15`, borderLeftColor: colors.primary },
                  ],
                ]}
              >
                <Text style={styles.verseText}>
                  <Text style={styles.verseNumber}>{convertToSuperscript(verse.verse)}</Text>
                  {verse.text}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Book Picker Modal */}
      <Modal
        visible={showBookPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#F5F1E9' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Book</Text>
              <TouchableOpacity onPress={() => setShowBookPicker(false)}>
                <Text style={[styles.modalClose, { color: colors.darker }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={allBooks}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    item.name === bookName && [styles.pickerItemSelected, { backgroundColor: `${colors.primary}20` }],
                  ]}
                  onPress={() => handleBookSelect(item.name)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      item.name === bookName && { color: colors.primary, fontFamily: 'Nunito_600SemiBold' },
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Chapter Picker Modal */}
      <Modal
        visible={showChapterPicker}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowChapterPicker(false);
          setSelectedBookForChapters('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#F5F1E9' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{bookForChapters}</Text>
              <View style={styles.modalHeaderButtons}>
                <TouchableOpacity
                  onPress={() => {
                    setShowChapterPicker(false);
                    setTimeout(() => setShowBookPicker(true), 300);
                  }}
                  style={styles.modalHeaderButton}
                >
                  <Text style={[styles.modalHeaderButtonText, { color: colors.primary }]}>Change Book</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    setShowChapterPicker(false);
                    setSelectedBookForChapters('');
                  }}
                >
                  <Text style={[styles.modalClose, { color: colors.darker }]}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
              data={chapters}
              keyExtractor={(item) => item.toString()}
              numColumns={4}
              renderItem={({ item }) => {
                const isCurrentChapter = item === chapter && bookForChapters === bookName;
                return (
                  <TouchableOpacity
                    style={[
                      styles.pickerItemChapter,
                      isCurrentChapter && [styles.pickerItemSelected, { backgroundColor: `${colors.primary}20` }],
                    ]}
                    onPress={() => handleChapterSelect(item)}
                  >
                    <Text
                      style={[
                        styles.pickerItemTextChapter,
                        isCurrentChapter && { color: colors.primary, fontFamily: 'Nunito_600SemiBold' },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleSpacing(20),
    paddingBottom: scaleSpacing(16),
    backgroundColor: '#F5F1E9',
  },
  backButtonText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
  },
  locationButton: {
    alignItems: 'center',
    paddingHorizontal: scaleSpacing(12),
    paddingVertical: scaleSpacing(8),
  },
  locationContainer: {
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSpacing(6),
    marginBottom: scaleSpacing(2),
  },
  locationText: {
    fontSize: scaleFontSize(18, 16),
    fontFamily: 'Nunito_600SemiBold',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    // color will be set dynamically via inline style
  },
  locationHint: {
    fontSize: scaleFontSize(12, 10),
    fontFamily: 'Nunito_400Regular',
    opacity: 0.7,
    // color will be set dynamically via inline style
  },
  navButtons: {
    flexDirection: 'row',
    gap: scaleSpacing(8),
  },
  navButton: {
    padding: scaleSpacing(8),
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scaleSpacing(20),
    paddingBottom: scaleSpacing(40),
  },
  contentWrapper: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  verseContainer: {
    marginBottom: scaleSpacing(16),
    paddingLeft: scaleSpacing(4),
  },
  verseHighlighted: {
    paddingLeft: scaleSpacing(12),
    paddingVertical: scaleSpacing(8),
    borderRadius: scaleSpacing(4),
    borderLeftWidth: 3,
  },
  verseText: {
    fontSize: scaleFontSize(18, 16),
    fontFamily: 'Lora_400Regular',
    lineHeight: scaleFontSize(28, 24),
    color: '#3E3A36',
  },
  verseNumber: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    marginRight: scaleSpacing(4),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: scaleSpacing(16),
  },
  loadingText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    borderTopLeftRadius: scaleSpacing(20),
    borderTopRightRadius: scaleSpacing(20),
    paddingTop: scaleSpacing(20),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scaleSpacing(20),
    paddingBottom: scaleSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E0DCD4',
  },
  modalTitle: {
    fontSize: scaleFontSize(20, 18),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    flex: 1,
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSpacing(16),
  },
  modalHeaderButton: {
    paddingVertical: scaleSpacing(4),
  },
  modalHeaderButtonText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_600SemiBold',
  },
  modalClose: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
  },
  pickerItem: {
    paddingHorizontal: scaleSpacing(20),
    paddingVertical: scaleSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E0DCD4',
  },
  pickerItemSelected: {
    // backgroundColor set dynamically
  },
  pickerItemText: {
    fontSize: scaleFontSize(18, 16),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
  },
  pickerItemChapter: {
    flex: 1,
    paddingVertical: scaleSpacing(16),
    alignItems: 'center',
    margin: scaleSpacing(4),
    borderRadius: scaleSpacing(8),
    borderWidth: 1,
    borderColor: '#E0DCD4',
  },
  pickerItemTextChapter: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
  },
});

