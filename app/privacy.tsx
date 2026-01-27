import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';
import { scaleFontSize, scaleSpacing } from '../src/utils/responsive';

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const headerPaddingTop = Math.max(insets.top + scaleSpacing(12), scaleSpacing(60));

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
          <Text style={styles.header}>Privacy Policy</Text>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.card}>
          <Text style={styles.subtitle}>Pocket Verse - The Right Verse for Right Now</Text>
          <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>

          {/* Section 1 */}
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Pocket Verse ("we," "our," or "the app") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
          </Text>
          <Text style={styles.paragraph}>
            By using Pocket Verse, you agree to the collection and use of information as described in this policy.
          </Text>

          {/* Section 2 */}
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          
          <Text style={styles.subheading}>Information You Provide</Text>
          <Text style={styles.bulletItem}>• Your prompts: The text you enter describing what's on your heart (e.g., "feeling anxious about work")</Text>
          <Text style={styles.bulletItem}>• Saved verses: Bible verses you choose to save to your collection</Text>

          <Text style={styles.subheading}>Information Collected Automatically</Text>
          <Text style={styles.bulletItem}>• Anonymous user ID: We use Firebase Anonymous Authentication to create a unique identifier for your account. This does not require your name, email, or any personal information.</Text>
          <Text style={styles.bulletItem}>• Usage data: Basic app usage statistics such as number of verses generated</Text>
          <Text style={styles.bulletItem}>• Subscription status: Whether you have an active premium subscription</Text>

          <Text style={styles.subheading}>Information We Do NOT Collect</Text>
          <Text style={styles.bulletItem}>• Your real name</Text>
          <Text style={styles.bulletItem}>• Your email address</Text>
          <Text style={styles.bulletItem}>• Your location</Text>
          <Text style={styles.bulletItem}>• Your contacts</Text>
          <Text style={styles.bulletItem}>• Device identifiers for advertising</Text>

          {/* Section 3 */}
          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>We use your information solely to:</Text>
          <Text style={styles.bulletItem}>• Provide the service: Your prompts are sent to our AI service to find relevant Bible verses</Text>
          <Text style={styles.bulletItem}>• Save your verses: Store your saved verses so you can access them later</Text>
          <Text style={styles.bulletItem}>• Manage subscriptions: Track your premium status to unlock features</Text>
          <Text style={styles.bulletItem}>• Improve the app: Understand general usage patterns (not individual behavior)</Text>

          {/* Section 4 */}
          <Text style={styles.sectionTitle}>4. AI Processing</Text>
          <Text style={styles.paragraph}>
            Pocket Verse uses OpenAI's API to analyze your prompts and suggest relevant Bible verses.
          </Text>
          <Text style={styles.bulletItem}>• Your prompts are sent to OpenAI's servers for processing</Text>
          <Text style={styles.bulletItem}>• OpenAI's use of this data is governed by their privacy policy and data processing terms</Text>
          <Text style={styles.bulletItem}>• We do not use your prompts to train AI models</Text>
          <Text style={styles.bulletItem}>• Prompts are processed in real-time and are not stored by us beyond what is necessary to deliver the service</Text>

          {/* Section 5 */}
          <Text style={styles.sectionTitle}>5. Data Storage</Text>
          <Text style={styles.bulletItem}>• Saved verses and user data are stored securely in Google Firebase (Firestore)</Text>
          <Text style={styles.bulletItem}>• Subscription data is managed by RevenueCat and Apple/Google</Text>
          <Text style={styles.bulletItem}>• All data is transmitted using industry-standard encryption (HTTPS/TLS)</Text>

          {/* Section 6 */}
          <Text style={styles.sectionTitle}>6. Data Retention</Text>
          <Text style={styles.bulletItem}>• Your saved verses are retained until you delete them or delete your account</Text>
          <Text style={styles.bulletItem}>• Anonymous account data is retained as long as you use the app</Text>
          <Text style={styles.bulletItem}>• If you uninstall the app and do not reinstall within 12 months, your anonymous account may be automatically deleted</Text>

          {/* Section 7 */}
          <Text style={styles.sectionTitle}>7. Data Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We only share data with:
          </Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableCol1]}>Third Party</Text>
              <Text style={[styles.tableHeaderText, styles.tableCol2]}>Purpose</Text>
              <Text style={[styles.tableHeaderText, styles.tableCol3]}>Data Shared</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCol1]}>OpenAI</Text>
              <Text style={[styles.tableCell, styles.tableCol2]}>AI verse matching</Text>
              <Text style={[styles.tableCell, styles.tableCol3]}>Your prompts (text only)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCol1]}>Firebase/Google</Text>
              <Text style={[styles.tableCell, styles.tableCol2]}>Data storage & authentication</Text>
              <Text style={[styles.tableCell, styles.tableCol3]}>Anonymous ID, saved verses</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCol1]}>RevenueCat</Text>
              <Text style={[styles.tableCell, styles.tableCol2]}>Subscription management</Text>
              <Text style={[styles.tableCell, styles.tableCol3]}>Anonymous ID, purchase status</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCol1]}>Apple/Google</Text>
              <Text style={[styles.tableCell, styles.tableCol2]}>Payment processing</Text>
              <Text style={[styles.tableCell, styles.tableCol3]}>Payment info (handled by them)</Text>
            </View>
          </View>

          {/* Section 8 */}
          <Text style={styles.sectionTitle}>8. Your Rights</Text>
          <Text style={styles.paragraph}>You have the right to:</Text>
          <Text style={styles.bulletItem}>• Access: View all your saved verses within the app</Text>
          <Text style={styles.bulletItem}>• Delete: Remove individual saved verses or request full account deletion</Text>
          <Text style={styles.bulletItem}>• Opt-out: Stop using the app at any time</Text>
          <Text style={styles.paragraph}>To request account deletion, contact us at the email below.</Text>

          {/* Section 9 */}
          <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Pocket Verse is not directed at children under 13. We do not knowingly collect information from children under 13. If you believe a child has provided us with personal information, please contact us.
          </Text>

          {/* Section 10 */}
          <Text style={styles.sectionTitle}>10. Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational measures to protect your data, including:
          </Text>
          <Text style={styles.bulletItem}>• Encrypted data transmission (TLS)</Text>
          <Text style={styles.bulletItem}>• Secure cloud infrastructure (Firebase)</Text>
          <Text style={styles.bulletItem}>• Anonymous authentication (no passwords to steal)</Text>
          <Text style={styles.paragraph}>
            However, no method of transmission over the internet is 100% secure.
          </Text>

          {/* Section 11 */}
          <Text style={styles.sectionTitle}>11. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of significant changes through the app. Your continued use after changes constitutes acceptance of the updated policy.
          </Text>

          {/* Section 12 */}
          <Text style={styles.sectionTitle}>12. Contact</Text>
          <Text style={styles.paragraph}>For privacy questions or data deletion requests:</Text>
          <Text style={styles.contactEmail}>contact@instapush.org</Text>

          {/* Section 13 */}
          <Text style={styles.sectionTitle}>13. Governing Law</Text>
          <Text style={styles.paragraph}>
            This Privacy Policy is governed by the laws of Norway.
          </Text>
        </View>
        </ScrollView>
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
    fontSize: scaleFontSize(24, 20),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scaleSpacing(20),
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: scaleSpacing(20),
  },
  subtitle: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
    color: '#5C3A1E',
    textAlign: 'center',
    marginBottom: scaleSpacing(8),
  },
  lastUpdated: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    color: '#6B5E50',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: scaleSpacing(24),
  },
  sectionTitle: {
    fontSize: scaleFontSize(18, 16),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    marginTop: scaleSpacing(24),
    marginBottom: scaleSpacing(12),
  },
  subheading: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
    color: '#5C3A1E',
    marginTop: scaleSpacing(16),
    marginBottom: scaleSpacing(8),
  },
  paragraph: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
    lineHeight: scaleFontSize(24, 20),
    marginBottom: scaleSpacing(12),
  },
  bulletItem: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
    lineHeight: scaleFontSize(24, 20),
    marginBottom: scaleSpacing(8),
    paddingLeft: scaleSpacing(8),
  },
  table: {
    marginVertical: scaleSpacing(16),
    borderWidth: 1,
    borderColor: '#E8E4DD',
    borderRadius: scaleSpacing(8),
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E8E4DD',
    paddingVertical: scaleSpacing(10),
    paddingHorizontal: scaleSpacing(8),
  },
  tableHeaderText: {
    fontSize: scaleFontSize(13, 11),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E8E4DD',
    paddingVertical: scaleSpacing(10),
    paddingHorizontal: scaleSpacing(8),
  },
  tableCell: {
    fontSize: scaleFontSize(12, 10),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
  },
  tableCol1: {
    flex: 1,
  },
  tableCol2: {
    flex: 1.5,
  },
  tableCol3: {
    flex: 1.5,
  },
  contactEmail: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_600SemiBold',
    color: '#5C3A1E',
    marginBottom: scaleSpacing(12),
  },
});



