import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { usePremium } from '../../src/contexts/PremiumContext';
import { getSavedVerses, deleteVerse, SavedVerse } from '../../src/services/firestore';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { showFirestoreError } from '../../src/utils/errorHandler';
import { BookOpen } from 'react-native-feather';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../../src/utils/responsive';

export default function SavedScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { isPremium } = usePremium();
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const loadSavedVerses = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const verses = await getSavedVerses(user.uid);
      setSavedVerses(verses);
    } catch (error) {
      showFirestoreError(error, loadSavedVerses);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Load verses on mount
  useEffect(() => {
    loadSavedVerses();
  }, [loadSavedVerses]);

  // Reload when screen comes into focus (e.g., after saving a verse)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadSavedVerses();
      }
    }, [user, loadSavedVerses])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadSavedVerses();
  }, [loadSavedVerses]);

  const handleVersePress = (verse: SavedVerse) => {
    // Free users go to paywall when tapping locked cards
    if (!isPremium) {
      router.push('/paywall');
      return;
    }
    
    // Premium users see full content
    router.push({
      pathname: '/result',
      params: {
        reference: verse.verseReference,
        text: verse.verseText,
        explanation: verse.explanation,
        originalInput: verse.originalInput || '',
        verseId: verse.id, // Pass the verse ID for deletion
        from: 'saved', // Indicate we came from saved verses
      },
    });
  };

  const handleLongPress = (verse: SavedVerse) => {
    Alert.alert(
      'Delete Verse',
      `Are you sure you want to delete "${verse.verseReference}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;

            try {
              await deleteVerse(user.uid, verse.id);
              // Remove from local state
              setSavedVerses((prev) => prev.filter((v) => v.id !== verse.id));
            } catch (error) {
              showFirestoreError(error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      // Handle Firestore Timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date.getTime())) return 'Unknown date';
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch (error) {
      return 'Unknown date';
    }
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Helper function to blend theme color with white for a subtle tint
  const getTintedCardColor = (themeColor: string): string => {
    // Base is basically white (brighter than background #F5F1E9)
    const baseColor = { r: 255, g: 255, b: 255 }; // Pure white
    
    // Parse theme color hex to RGB
    const hex = themeColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Blend: 6% theme color, 94% white (subtle but noticeable hint)
    const blendRatio = 0.06;
    const blendedR = Math.round(r * blendRatio + baseColor.r * (1 - blendRatio));
    const blendedG = Math.round(g * blendRatio + baseColor.g * (1 - blendRatio));
    const blendedB = Math.round(b * blendRatio + baseColor.b * (1 - blendRatio));
    
    // Convert back to hex
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(blendedR)}${toHex(blendedG)}${toHex(blendedB)}`;
  };

  const renderVerseCard = ({ item }: { item: SavedVerse }) => {
    const cardBackgroundColor = getTintedCardColor(colors.primary);
    
    // Free users see locked cards
    if (!isPremium) {
      return (
        <TouchableOpacity
          style={[styles.card, { backgroundColor: cardBackgroundColor }]}
          onPress={() => handleVersePress(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.cardDate}>{formatDate(item.savedAt)}</Text>
          <View style={styles.lockedCardContent}>
            <Text style={styles.lockedCardText}>Tap to Unlock Saved Verse</Text>
          </View>
        </TouchableOpacity>
      );
    }
    
    // Premium users see full content
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBackgroundColor }]}
        onPress={() => handleVersePress(item)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.cardReference}>{item.verseReference}</Text>
        <Text style={styles.cardText} numberOfLines={2}>
          {truncateText(item.verseText)}
        </Text>
        <Text style={styles.cardDate}>{formatDate(item.savedAt)}</Text>
      </TouchableOpacity>
    );
  };

  const emptyIconSize = scaleIconSize(48);
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <BookOpen width={emptyIconSize} height={emptyIconSize} color={colors.lighter} strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyTitle}>No saved verses yet</Text>
      <Text style={styles.emptyText}>
        Verses you save will appear here
      </Text>
    </View>
  );

  const headerPaddingTop = Math.max(insets.top + scaleSpacing(12), scaleSpacing(60));
  
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
            <Text style={styles.headerTitle}>Saved Verses</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>Back →</Text>
            </TouchableOpacity>
          </View>
          {renderEmptyState()}
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
            <Text style={styles.headerTitle}>Saved Verses</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>Back →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.loadingContainer}>
            <LoadingSpinner message="Loading saved verses..." />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
          <Text style={styles.headerTitle}>Saved Verses</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Back →</Text>
          </TouchableOpacity>
        </View>

        {/* Banner for free users */}
        {!isPremium && savedVerses.length > 0 && (
          <TouchableOpacity
            style={[styles.banner, { backgroundColor: colors.darker }]}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
          >
            <Text style={styles.bannerHeadline}>Unlock Your Saved Verses</Text>
            <Text style={styles.bannerSubtext}>Look back on verses, and get access to deeper reflections</Text>
          </TouchableOpacity>
        )}

        {savedVerses.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={savedVerses}
            renderItem={renderVerseCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.darker}
                colors={[colors.darker]}
              />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E9',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  header: {
    paddingTop: scaleSpacing(60),
    paddingBottom: scaleSpacing(20),
    paddingHorizontal: scaleSpacing(20),
    backgroundColor: '#F5F1E9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: scaleFontSize(28, 22),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
  },
  backButton: {
    paddingVertical: scaleSpacing(8),
    paddingHorizontal: scaleSpacing(12),
  },
  backButtonText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
    // color will be set dynamically via inline style
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: scaleSpacing(20),
    paddingTop: scaleSpacing(10),
  },
  card: {
    // backgroundColor will be set dynamically via inline style
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(20),
    marginBottom: scaleSpacing(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardReference: {
    fontSize: scaleFontSize(18, 15),
    fontFamily: 'Nunito_600SemiBold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(8),
  },
  cardText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Lora_400Regular_Italic',
    color: '#3E3A36',
    lineHeight: scaleFontSize(24, 20),
    marginBottom: scaleSpacing(12),
  },
  cardDate: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    // color will be set dynamically via inline style
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scaleSpacing(40),
  },
  emptyIconContainer: {
    marginBottom: scaleSpacing(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: scaleFontSize(22, 18),
    fontFamily: 'Nunito_600SemiBold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(12),
    textAlign: 'center',
  },
  emptyText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: scaleFontSize(24, 20),
  },
  banner: {
    // backgroundColor will be set dynamically via inline style
    borderRadius: 0,
    padding: scaleSpacing(15),
    marginHorizontal: 0,
    marginBottom: scaleSpacing(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  bannerHeadline: {
    fontSize: scaleFontSize(20, 17),
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
    marginBottom: scaleSpacing(8),
    textAlign: 'center',
  },
  bannerSubtext: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    color: '#FFFFFF',
    lineHeight: scaleFontSize(20, 17),
    textAlign: 'center',
    opacity: 0.9,
  },
  lockedCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: scaleSpacing(80),
  },
  lockedCardText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
    color: '#5C3A1E',
    textAlign: 'center',
  },
});
