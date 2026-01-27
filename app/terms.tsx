import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';
import { scaleFontSize, scaleSpacing } from '../src/utils/responsive';

export default function TermsOfUseScreen() {
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
          <Text style={styles.header}>Terms of Use</Text>
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
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By downloading, accessing, or using Pocket Verse ("the app"), you agree to be bound by these Terms of Use. If you do not agree to these terms, do not use the app.
          </Text>

          {/* Section 2 */}
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            Pocket Verse is a mobile application that helps users find Bible verses relevant to their feelings and situations. The app uses AI technology to match your input with scripture from the Christian Bible.
          </Text>
          <Text style={styles.paragraph}>The app allows users to:</Text>
          <Text style={styles.bulletItem}>• Describe what's on their heart and receive a relevant Bible verse</Text>
          <Text style={styles.bulletItem}>• Save verses to a personal collection (premium feature)</Text>
          <Text style={styles.bulletItem}>• View personalized reflections explaining why a verse was chosen (premium feature)</Text>

          {/* Section 3 */}
          <Text style={styles.sectionTitle}>3. Not Professional Advice</Text>
          <Text style={styles.importantText}>
            Pocket Verse is for personal spiritual reflection only. The verses and reflections provided are not professional counseling, therapy, or medical advice.
          </Text>
          <Text style={styles.bulletItem}>• Pocket Verse is not a substitute for professional mental health support</Text>
          <Text style={styles.bulletItem}>• If you are experiencing a mental health crisis, please contact a qualified professional or crisis helpline</Text>
          <Text style={styles.bulletItem}>• The app is a tool for spiritual encouragement, not professional guidance</Text>
          <Text style={styles.bulletItem}>• AI-generated reflections represent one interpretation and should not be taken as authoritative theological teaching</Text>

          {/* Section 4 */}
          <Text style={styles.sectionTitle}>4. Eligibility</Text>
          <Text style={styles.paragraph}>
            You must be at least 13 years old to use Pocket Verse. By using the app, you represent that you meet this age requirement.
          </Text>

          {/* Section 5 */}
          <Text style={styles.sectionTitle}>5. User Accounts</Text>
          <Text style={styles.bulletItem}>• Pocket Verse uses anonymous authentication - no email or password required</Text>
          <Text style={styles.bulletItem}>• Your account is tied to your device</Text>
          <Text style={styles.bulletItem}>• You are responsible for any activity that occurs through your account</Text>
          <Text style={styles.bulletItem}>• If you uninstall the app, you may lose access to your saved verses unless you reinstall on the same device</Text>

          {/* Section 6 */}
          <Text style={styles.sectionTitle}>6. Free and Premium Tiers</Text>
          
          <Text style={styles.subheading}>Free Tier</Text>
          <Text style={styles.bulletItem}>• 1 verse generation per day</Text>
          <Text style={styles.bulletItem}>• Ability to save verses (viewable with premium)</Text>
          
          <Text style={styles.subheading}>Premium Tier</Text>
          <Text style={styles.bulletItem}>• Unlimited verse generations</Text>
          <Text style={styles.bulletItem}>• Access to view all saved verses</Text>
          <Text style={styles.bulletItem}>• Personalized reflections ("Why this verse")</Text>
          <Text style={styles.bulletItem}>• Ad-free experience</Text>

          {/* Section 7 */}
          <Text style={styles.sectionTitle}>7. Subscriptions and Payments</Text>
          
          <Text style={styles.subheading}>Billing</Text>
          <Text style={styles.bulletItem}>• Subscriptions are billed through Apple's App Store or Google Play Store</Text>
          <Text style={styles.bulletItem}>• Payment is charged to your account at confirmation of purchase</Text>
          <Text style={styles.bulletItem}>• Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period</Text>

          <Text style={styles.subheading}>Cancellation</Text>
          <Text style={styles.bulletItem}>• You may cancel your subscription at any time through your device settings</Text>
          <Text style={styles.bulletItem}>• iOS: Settings → Apple ID → Subscriptions → Pocket Verse → Cancel</Text>
          <Text style={styles.bulletItem}>• Android: Play Store → Profile → Payments & Subscriptions → Pocket Verse → Cancel</Text>
          <Text style={styles.bulletItem}>• Cancellation takes effect at the end of the current billing period</Text>
          <Text style={styles.bulletItem}>• No refunds are provided for partial billing periods</Text>

          <Text style={styles.subheading}>Price Changes</Text>
          <Text style={styles.bulletItem}>• We reserve the right to change subscription prices</Text>
          <Text style={styles.bulletItem}>• You will be notified of any price changes in advance</Text>

          {/* Section 8 */}
          <Text style={styles.sectionTitle}>8. Acceptable Use</Text>
          <Text style={styles.paragraph}>You agree not to:</Text>
          <Text style={styles.bulletItem}>• Use the app for any unlawful purpose</Text>
          <Text style={styles.bulletItem}>• Attempt to manipulate or abuse the AI system</Text>
          <Text style={styles.bulletItem}>• Attempt to gain unauthorized access to the app or its systems</Text>
          <Text style={styles.bulletItem}>• Reverse engineer, decompile, or disassemble any part of the app</Text>
          <Text style={styles.bulletItem}>• Use the app to generate content that is hateful, harmful, or inappropriate</Text>
          <Text style={styles.bulletItem}>• Share or redistribute content from the app without permission</Text>

          {/* Section 9 */}
          <Text style={styles.sectionTitle}>9. AI-Generated Content</Text>
          <Text style={styles.bulletItem}>• Bible verses are sourced from established translations of the Christian Bible</Text>
          <Text style={styles.bulletItem}>• Reflections and explanations are generated by AI and may not reflect all theological perspectives</Text>
          <Text style={styles.bulletItem}>• AI suggestions are meant to comfort and encourage, not to provide definitive spiritual direction</Text>
          <Text style={styles.bulletItem}>• We do not guarantee that every verse suggestion will perfectly match your situation</Text>

          {/* Section 10 */}
          <Text style={styles.sectionTitle}>10. Intellectual Property</Text>
          <Text style={styles.bulletItem}>• All app content, features, design, and functionality are owned by us and protected by intellectual property laws</Text>
          <Text style={styles.bulletItem}>• Bible verses are in the public domain or used under appropriate licenses</Text>
          <Text style={styles.bulletItem}>• The Pocket Verse name, logo, and branding are our trademarks</Text>
          <Text style={styles.bulletItem}>• You may share individual verses through the app's share feature for personal, non-commercial use</Text>

          {/* Section 11 */}
          <Text style={styles.sectionTitle}>11. Privacy</Text>
          <Text style={styles.paragraph}>
            Your use of Pocket Verse is also governed by our Privacy Policy. By using the app, you consent to our data practices as described in the Privacy Policy.
          </Text>

          {/* Section 12 */}
          <Text style={styles.sectionTitle}>12. Disclaimers</Text>
          <Text style={styles.legalText}>
            THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
          </Text>
          <Text style={styles.paragraph}>We do not warrant that:</Text>
          <Text style={styles.bulletItem}>• The app will meet your specific spiritual needs</Text>
          <Text style={styles.bulletItem}>• The app will be uninterrupted, timely, secure, or error-free</Text>
          <Text style={styles.bulletItem}>• AI-generated content will be accurate or appropriate for every situation</Text>
          <Text style={styles.bulletItem}>• The app will be compatible with all devices</Text>

          {/* Section 13 */}
          <Text style={styles.sectionTitle}>13. Limitation of Liability</Text>
          <Text style={styles.legalText}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
          </Text>
          <Text style={styles.bulletItem}>• Emotional distress or spiritual harm</Text>
          <Text style={styles.bulletItem}>• Loss of data or saved verses</Text>
          <Text style={styles.bulletItem}>• Any damages arising from your use or inability to use the app</Text>
          <Text style={styles.paragraph}>
            Our total liability shall not exceed the amount you paid for the app in the 12 months preceding the claim.
          </Text>

          {/* Section 14 */}
          <Text style={styles.sectionTitle}>14. Indemnification</Text>
          <Text style={styles.paragraph}>
            You agree to indemnify and hold us harmless from any claims, damages, losses, or expenses arising from:
          </Text>
          <Text style={styles.bulletItem}>• Your use of the app</Text>
          <Text style={styles.bulletItem}>• Your violation of these terms</Text>
          <Text style={styles.bulletItem}>• Your violation of any rights of another party</Text>

          {/* Section 15 */}
          <Text style={styles.sectionTitle}>15. Termination</Text>
          <Text style={styles.bulletItem}>• We may suspend or terminate your access to the app at any time for violation of these terms</Text>
          <Text style={styles.bulletItem}>• You may stop using the app at any time</Text>
          <Text style={styles.bulletItem}>• Upon termination, your right to use the app ceases immediately</Text>

          {/* Section 16 */}
          <Text style={styles.sectionTitle}>16. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these terms at any time. We will notify users of material changes through the app. Your continued use of the app after changes constitutes acceptance of the new terms.
          </Text>

          {/* Section 17 */}
          <Text style={styles.sectionTitle}>17. Governing Law</Text>
          <Text style={styles.paragraph}>
            These terms shall be governed by and construed in accordance with the laws of Norway, without regard to conflict of law principles.
          </Text>

          {/* Section 18 */}
          <Text style={styles.sectionTitle}>18. Severability</Text>
          <Text style={styles.paragraph}>
            If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
          </Text>

          {/* Section 19 */}
          <Text style={styles.sectionTitle}>19. Entire Agreement</Text>
          <Text style={styles.paragraph}>
            These Terms of Use, together with our Privacy Policy, constitute the entire agreement between you and Pocket Verse regarding your use of the app.
          </Text>

          {/* Section 20 */}
          <Text style={styles.sectionTitle}>20. Contact</Text>
          <Text style={styles.paragraph}>For questions about these terms:</Text>
          <Text style={styles.contactEmail}>contact@instapush.org</Text>
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
  importantText: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    lineHeight: scaleFontSize(24, 20),
    marginBottom: scaleSpacing(12),
  },
  legalText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_600SemiBold',
    color: '#5C3A1E',
    lineHeight: scaleFontSize(22, 18),
    marginBottom: scaleSpacing(12),
    backgroundColor: '#F5F1E9',
    padding: scaleSpacing(12),
    borderRadius: scaleSpacing(8),
  },
  contactEmail: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_600SemiBold',
    color: '#5C3A1E',
    marginBottom: scaleSpacing(12),
  },
});



