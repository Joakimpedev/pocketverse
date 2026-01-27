import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';
import { scaleFontSize, scaleSpacing } from '../src/utils/responsive';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const faqData: FAQSection[] = [
  {
    title: 'General',
    items: [
      {
        question: 'What is Pocket Verse?',
        answer: 'Pocket Verse is a mobile app that helps you find Bible verses that speak to your current feelings and situations. Simply describe what\'s on your heart, and we\'ll find a verse that offers comfort, guidance, or encouragement.',
      },
      {
        question: 'How does it work?',
        answer: 'You type in how you\'re feeling or what you\'re going through (e.g., "feeling anxious about a job interview"). Our AI analyzes your input and searches the entire Bible to find a verse that speaks to your situation.',
      },
      {
        question: 'Which Bible translation do you use?',
        answer: 'We draw from multiple well-known translations to find the verse that best fits your situation and reads clearly.',
      },
      {
        question: 'Is this app affiliated with any church or denomination?',
        answer: 'No. Pocket Verse is a non-denominational app designed to help anyone find comfort in scripture, regardless of their church background.',
      },
    ],
  },
  {
    title: 'Using the App',
    items: [
      {
        question: 'How many verses can I get per day?',
        answer: 'Free users can generate 1 verse per day. Premium subscribers have unlimited access.',
      },
      {
        question: 'Why only 1 verse per day for free users?',
        answer: 'We designed it this way to encourage meaningful, intentional reflection rather than casual browsing. Think of it as your daily moment with scripture.',
      },
      {
        question: 'Can I get a different verse if the first one doesn\'t feel right?',
        answer: 'Free users receive 1 verse per day. If you\'d like to try again, you can upgrade to Premium for unlimited verses.',
      },
      {
        question: 'What should I type in the prompt?',
        answer: 'Be honest and specific about what you\'re feeling. For example:\n\n• "I\'m worried about my health"\n• "Feeling lonely and disconnected"\n• "Grateful but don\'t know how to express it"\n• "Struggling to forgive someone"\n\nThe more genuine your input, the more relevant the verse will be.',
      },
    ],
  },
  {
    title: 'Saving Verses',
    items: [
      {
        question: 'How do I save a verse?',
        answer: 'Tap the "Save" button on any verse you receive. It will be added to your saved collection.',
      },
      {
        question: 'Why can\'t I see my saved verses?',
        answer: 'Viewing saved verses is a Premium feature. Free users can save verses, but you\'ll need Premium to access your collection.',
      },
      {
        question: 'Will I lose my saved verses if I cancel Premium?',
        answer: 'Your verses remain saved. If you resubscribe later, they\'ll still be there. You just won\'t be able to view them without an active subscription.',
      },
      {
        question: 'Can I delete saved verses?',
        answer: 'Yes. Open any saved verse and tap "Delete" to remove it from your collection.',
      },
    ],
  },
  {
    title: 'Premium',
    items: [
      {
        question: 'What do I get with Premium?',
        answer: '• Unlimited verses: No daily limit\n• Saved verses access: View and revisit all your saved verses\n• Reflections: See personalized explanations of why each verse was chosen for you\n• Ad-free experience',
      },
      {
        question: 'How much does Premium cost?',
        answer: 'Check the app for current pricing. We offer both monthly and yearly subscription options.',
      },
      {
        question: 'How do I subscribe?',
        answer: 'Tap on any Premium feature prompt in the app, or go to Settings to view subscription options.',
      },
      {
        question: 'How do I cancel my subscription?',
        answer: 'iOS: Settings → Apple ID → Subscriptions → Pocket Verse → Cancel\n\nAndroid: Play Store → Profile → Payments & Subscriptions → Pocket Verse → Cancel\n\nCancellation takes effect at the end of your current billing period.',
      },
      {
        question: 'Can I get a refund?',
        answer: 'Refunds are handled by Apple or Google, not by us directly. Contact their support for refund requests.',
      },
      {
        question: 'I paid but Premium isn\'t showing. What do I do?',
        answer: 'Try these steps:\n\n1. Close and reopen the app\n2. Go to Settings and tap "Restore Purchases"\n3. Make sure you\'re signed into the same Apple ID / Google account used for purchase\n\nIf it still doesn\'t work, contact us at contact@instapush.org',
      },
    ],
  },
  {
    title: 'Privacy & Data',
    items: [
      {
        question: 'Do you store what I type?',
        answer: 'Your prompts are processed to find relevant verses but are not permanently stored by us. See our Privacy Policy for full details.',
      },
      {
        question: 'Do I need to create an account?',
        answer: 'No. Pocket Verse uses anonymous authentication - no email, password, or personal information required.',
      },
      {
        question: 'Can I delete my data?',
        answer: 'Yes. Contact us at contact@instapush.org to request account deletion.',
      },
      {
        question: 'Is my data shared with anyone?',
        answer: 'We use OpenAI to process your prompts and Firebase to store your saved verses. We do not sell your data. See our Privacy Policy for details.',
      },
    ],
  },
  {
    title: 'Technical Issues',
    items: [
      {
        question: 'The app isn\'t loading / crashes on startup',
        answer: 'Try these steps:\n\n1. Close the app completely and reopen\n2. Check your internet connection\n3. Update to the latest version from the App Store / Play Store\n4. Restart your device\n5. Uninstall and reinstall the app (note: you may lose saved data)',
      },
      {
        question: 'I\'m not receiving a verse / it\'s taking too long',
        answer: 'This usually means a connection issue. Check your internet and try again. If the problem persists, the AI service may be temporarily unavailable.',
      },
      {
        question: 'A verse seems cut off or incomplete',
        answer: 'This is rare but can happen. Tap "New verse" to get a different one. If it keeps happening, please contact us.',
      },
    ],
  },
  {
    title: 'Feedback & Support',
    items: [
      {
        question: 'How do I report a problem?',
        answer: 'Email us at contact@instapush.org with a description of the issue.',
      },
      {
        question: 'Can I suggest a feature?',
        answer: 'Yes! We\'d love to hear from you. Send suggestions to contact@instapush.org',
      },
      {
        question: 'How can I leave a review?',
        answer: 'If Pocket Verse has been meaningful to you, we\'d appreciate a review on the App Store or Google Play. It helps others discover the app.',
      },
    ],
  },
];

function FAQItemComponent({ item, isExpanded, onToggle, colors }: { 
  item: FAQItem; 
  isExpanded: boolean; 
  onToggle: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity 
      style={styles.faqItem} 
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.questionRow}>
        <Text style={styles.question}>{item.question}</Text>
        <Text style={[styles.chevron, { color: colors.primary }]}>
          {isExpanded ? '−' : '+'}
        </Text>
      </View>
      {isExpanded && (
        <Text style={styles.answer}>{item.answer}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function FAQScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const headerPaddingTop = Math.max(insets.top + scaleSpacing(12), scaleSpacing(60));
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
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
          <Text style={styles.header}>FAQ</Text>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.introCard}>
          <Text style={styles.subtitle}>Pocket Verse</Text>
          <Text style={styles.tagline}>The Right Verse for Right Now</Text>
        </View>

        {faqData.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, itemIndex) => {
                const key = `${sectionIndex}-${itemIndex}`;
                const isLast = itemIndex === section.items.length - 1;
                return (
                  <View key={key}>
                    <FAQItemComponent
                      item={item}
                      isExpanded={expandedItems.has(key)}
                      onToggle={() => toggleItem(key)}
                      colors={colors}
                    />
                    {!isLast && <View style={styles.divider} />}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactText}>Email: contact@instapush.org</Text>
            <Text style={styles.responseTime}>We typically respond within 48 hours.</Text>
          </View>
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
    fontSize: scaleFontSize(28, 22),
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
  introCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(20),
    alignItems: 'center',
    marginBottom: scaleSpacing(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subtitle: {
    fontSize: scaleFontSize(20, 18),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(4),
  },
  tagline: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Lora_400Regular_Italic',
    color: '#6B5E50',
  },
  section: {
    marginBottom: scaleSpacing(24),
  },
  sectionTitle: {
    fontSize: scaleFontSize(18, 16),
    fontFamily: 'Nunito_700Bold',
    marginBottom: scaleSpacing(12),
  },
  card: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  faqItem: {
    padding: scaleSpacing(16),
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  question: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_600SemiBold',
    color: '#3E3A36',
    flex: 1,
    paddingRight: scaleSpacing(12),
  },
  chevron: {
    fontSize: scaleFontSize(24, 20),
    fontFamily: 'Nunito_700Bold',
  },
  answer: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    color: '#5C3A1E',
    lineHeight: scaleFontSize(22, 18),
    marginTop: scaleSpacing(12),
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E4DD',
    marginHorizontal: scaleSpacing(16),
  },
  contactSection: {
    marginBottom: scaleSpacing(40),
  },
  contactTitle: {
    fontSize: scaleFontSize(18, 16),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(12),
  },
  contactCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactText: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_600SemiBold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(8),
  },
  responseTime: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    color: '#6B5E50',
    fontStyle: 'italic',
  },
});



