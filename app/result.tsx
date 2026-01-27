import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Share, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { deleteVerse } from '../src/services/firestore';
import { showFirestoreError } from '../src/utils/errorHandler';
import { scaleFontSize, scaleSpacing } from '../src/utils/responsive';

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    reference: string;
    text: string;
    explanation: string;
    originalInput?: string; // The original user input
    verseId?: string; // ID of the saved verse for deletion
    from?: string; // Track where we came from
  }>();

  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [deleting, setDeleting] = useState(false);

  const handleBack = () => {
    // If we came from saved verses, navigate back there explicitly
    if (params.from === 'saved') {
      router.push('/(tabs)/saved');
    } else {
      // Try to go back, or navigate to home if that fails
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push('/(tabs)');
      }
    }
  };

  // Get verse data from route params
  const verseData = {
    reference: params.reference || 'Unknown Reference',
    text: params.text || 'No verse text provided',
    explanation: params.explanation || 'No explanation provided',
    originalInput: params.originalInput || '',
  };

  const handleDelete = async () => {
    if (!user || !params.verseId) {
      Alert.alert('Error', 'Cannot delete verse.');
      return;
    }

    Alert.alert(
      'Delete Verse',
      'Are you sure you want to unsave this verse?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteVerse(user.uid, params.verseId!);
              // Navigate back to saved verses after deletion
              router.push('/(tabs)/saved');
            } catch (error) {
              showFirestoreError(error);
              setDeleting(false);
            }
          },
        },
      ]
    );
  };


  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `"${verseData.text}" - ${verseData.reference}\n\nFrom Pocket Verse app`,
        title: verseData.reference,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share verse. Please try again.');
    }
  };

  const handleNewVerse = () => {
        router.push('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + scaleSpacing(12), scaleSpacing(40)) }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
        <View style={styles.content}>
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={[styles.backButtonText, { color: colors.darker }]}>← Back</Text>
          </TouchableOpacity>

          {/* Original Input Section - Stuck to top */}
          {verseData.originalInput && (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>What was on your mind:</Text>
              <Text style={styles.inputText}>"{verseData.originalInput}"</Text>
            </View>
          )}
          
          {/* Centered verse content section */}
          <View style={styles.verseContent}>
            {/* Verse reference */}
            <Text style={styles.reference}>{verseData.reference}</Text>

            {/* Verse text */}
            <Text style={styles.verseText}>"{verseData.text}"</Text>

            {/* Divider line */}
            <View style={[styles.divider, { backgroundColor: colors.lighter }]} />

            {/* Section header */}
            <Text style={styles.sectionHeader}>Why this verse:</Text>

            {/* Explanation */}
            <Text style={styles.explanation}>{verseData.explanation}</Text>
          </View>
        </View>

        {/* Bottom row: Action buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.darker }]} 
            onPress={handleDelete}
            disabled={deleting || !params.verseId}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>Delete</Text>
            )}
          </TouchableOpacity>
          <View style={styles.buttonSpacer} />
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={handleShare}>
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          <View style={styles.buttonSpacer} />
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={handleNewVerse}>
            <Text style={styles.actionButtonText}>New verse</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E9', // Warm parchment background
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scaleSpacing(20),
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
  },
  backButton: {
    marginBottom: scaleSpacing(16),
  },
  verseContent: {
    flex: 1,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
    // color will be set dynamically via inline style
  },
  inputSection: {
    backgroundColor: '#FAF7F2', // Lighter parchment for card (matches saved verse cards)
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(20),
    marginBottom: scaleSpacing(-20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(8),
  },
  inputText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Lora_400Regular_Italic',
    color: '#3E3A36',
    lineHeight: scaleFontSize(22, 18),
  },
  reference: {
    fontSize: scaleFontSize(24, 20),
    fontFamily: 'Nunito_700Bold',
    marginBottom: scaleSpacing(20),
    color: '#3E3A36', // Warm dark grey
    textAlign: 'center',
  },
  verseText: {
    fontSize: scaleFontSize(20, 17),
    fontFamily: 'Lora_400Regular_Italic',
    marginBottom: scaleSpacing(50),
    lineHeight: scaleFontSize(32, 26),
    color: '#3E3A36', // Warm dark grey for verse text
    textAlign: 'center',
  },
  divider: {
    height: 1,
    // backgroundColor will be set dynamically via inline style
    marginBottom: scaleSpacing(30),
    opacity: 0.3,
  },
  sectionHeader: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: scaleSpacing(10),
    marginTop: scaleSpacing(10),
    color: '#3E3A36', // Warm dark grey
    textAlign: 'left',
  },
  explanation: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Lora_400Regular',
    lineHeight: scaleFontSize(22, 18),
    color: '#3E3A36', // Warm dark grey
    textAlign: 'left',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scaleSpacing(30),
    marginBottom: scaleSpacing(20),
    paddingHorizontal: scaleSpacing(4),
  },
  buttonSpacer: {
    width: scaleSpacing(8),
  },
  actionButton: {
    // backgroundColor will be set dynamically via inline style
    borderRadius: scaleSpacing(12), // More rounded
    paddingVertical: scaleSpacing(12),
    paddingHorizontal: scaleSpacing(16),
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: scaleFontSize(16, 13),
    fontFamily: 'Nunito_600SemiBold',
  },
});
