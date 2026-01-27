import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';
import { useAuth } from '../src/contexts/AuthContext';
import { submitFeedback } from '../src/services/firestore';
import { scaleFontSize, scaleSpacing } from '../src/utils/responsive';

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const headerPaddingTop = Math.max(insets.top + scaleSpacing(12), scaleSpacing(60));
  
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert('Missing Feedback', 'Please enter your feedback before submitting.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be signed in to submit feedback.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitFeedback(user.uid, feedback.trim(), email.trim() || undefined);
      
      setIsSubmitted(true);
      setFeedback('');
      setEmail('');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewFeedback = () => {
    setIsSubmitted(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={[styles.headerContainer, { paddingTop: headerPaddingTop }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={[styles.backButtonText, { color: colors.darker }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Feedback</Text>
        </View>
        
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          {/* Intro Card */}
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>Help Shape Pocket Verse</Text>
            <Text style={styles.introText}>
              We'd love to hear your ideas, suggestions, and thoughts on how we can make Pocket Verse even better. Your feedback helps us plan future updates!
            </Text>
          </View>

          {isSubmitted ? (
            /* Thank You Card */
            <View style={styles.thankYouCard}>
              <Text style={styles.thankYouEmoji}>✨</Text>
              <Text style={styles.thankYouTitle}>Thank You!</Text>
              <Text style={styles.thankYouText}>
                Your feedback has been received. We truly appreciate you taking the time to help us improve Pocket Verse.
              </Text>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleNewFeedback}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>Submit More Feedback</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Feedback Form */
            <View style={styles.formCard}>
              <Text style={styles.formLabel}>Your Feedback</Text>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Share your ideas, suggestions, or what you'd like to see in future updates..."
                placeholderTextColor="#9B8E7D"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={feedback}
                onChangeText={setFeedback}
                editable={!isSubmitting}
              />

              <Text style={styles.formLabel}>Email (optional)</Text>
              <Text style={styles.formHint}>
                Leave your email if you'd like us to follow up on your feedback
              </Text>
              <TextInput
                style={styles.emailInput}
                placeholder="your@email.com"
                placeholderTextColor="#9B8E7D"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!isSubmitting}
              />

              <TouchableOpacity
                style={[
                  styles.submitButton, 
                  { backgroundColor: colors.primary },
                  isSubmitting && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Feedback</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Urgent Issues Notice */}
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Need Immediate Help?</Text>
            <Text style={styles.noticeText}>
              This feedback form is for suggestions and ideas for future updates. Response times may vary.
            </Text>
            <Text style={styles.noticeText}>
              If you're experiencing a bug, billing issue, or need a quicker response, please contact us directly:
            </Text>
            <View style={styles.emailBox}>
              <Text style={styles.emailLabel}>Email</Text>
              <Text style={[styles.emailAddress, { color: colors.primary }]}>
                contact@instapush.org
              </Text>
            </View>
            <Text style={styles.responseTime}>
              We typically respond to emails within 48 hours.
            </Text>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  headerContainer: {
    paddingTop: scaleSpacing(60),
    paddingBottom: scaleSpacing(20),
    paddingHorizontal: scaleSpacing(20),
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: scaleSpacing(8),
    paddingHorizontal: scaleSpacing(12),
    marginRight: scaleSpacing(12),
  },
  backButtonText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
    color: '#5C3A1E',
  },
  header: {
    fontSize: scaleFontSize(28, 22),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scaleSpacing(20),
    paddingTop: 0,
    paddingBottom: scaleSpacing(40),
  },
  introCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(20),
    marginBottom: scaleSpacing(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  introTitle: {
    fontSize: scaleFontSize(18, 16),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(8),
    textAlign: 'center',
  },
  introText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    color: '#5C3A1E',
    lineHeight: scaleFontSize(22, 18),
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(20),
    marginBottom: scaleSpacing(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formLabel: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(8),
  },
  formHint: {
    fontSize: scaleFontSize(13, 11),
    fontFamily: 'Nunito_400Regular',
    color: '#6B5E50',
    marginBottom: scaleSpacing(8),
  },
  feedbackInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSpacing(10),
    borderWidth: 1,
    borderColor: '#E8E4DD',
    padding: scaleSpacing(14),
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
    minHeight: scaleSpacing(140),
    marginBottom: scaleSpacing(20),
  },
  emailInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSpacing(10),
    borderWidth: 1,
    borderColor: '#E8E4DD',
    padding: scaleSpacing(14),
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
    marginBottom: scaleSpacing(20),
  },
  submitButton: {
    borderRadius: scaleSpacing(10),
    paddingVertical: scaleSpacing(14),
    paddingHorizontal: scaleSpacing(24),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scaleSpacing(50),
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
  },
  thankYouCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(32),
    marginBottom: scaleSpacing(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thankYouEmoji: {
    fontSize: scaleFontSize(48, 40),
    marginBottom: scaleSpacing(16),
  },
  thankYouTitle: {
    fontSize: scaleFontSize(22, 18),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(12),
  },
  thankYouText: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_400Regular',
    color: '#5C3A1E',
    lineHeight: scaleFontSize(24, 20),
    textAlign: 'center',
    marginBottom: scaleSpacing(24),
  },
  noticeCard: {
    backgroundColor: '#F0EBE3',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(20),
    borderWidth: 1,
    borderColor: '#E0D9CF',
    marginBottom: scaleSpacing(20),
  },
  noticeTitle: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(12),
  },
  noticeText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    color: '#5C3A1E',
    lineHeight: scaleFontSize(22, 18),
    marginBottom: scaleSpacing(12),
  },
  emailBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(8),
    padding: scaleSpacing(14),
    marginBottom: scaleSpacing(12),
  },
  emailLabel: {
    fontSize: scaleFontSize(12, 10),
    fontFamily: 'Nunito_600SemiBold',
    color: '#6B5E50',
    marginBottom: scaleSpacing(4),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emailAddress: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_700Bold',
  },
  responseTime: {
    fontSize: scaleFontSize(13, 11),
    fontFamily: 'Lora_400Regular_Italic',
    color: '#6B5E50',
  },
});

