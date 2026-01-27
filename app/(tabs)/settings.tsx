import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, Switch, ScrollView, Modal, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePremium } from '../../src/contexts/PremiumContext';
import { useTheme, ThemeName, themes } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import Constants from 'expo-constants';
import { showPaymentError, showSuccessAlert } from '../../src/utils/errorHandler';
import { getDevModePremium, setDevModePremium, getDevModeActivated, activateDevMode } from '../../src/services/devmode';
import { scaleFontSize, scaleSpacing } from '../../src/utils/responsive';
import { resetOnboarding, resetWelcome } from '../../src/services/onboarding';
import { areNotificationsEnabled, setNotificationsEnabled, requestNotificationPermissions } from '../../src/services/notifications';

export default function SettingsScreen() {
  const { isPremium, restore, isLoading: isPremiumLoading, refreshPremiumStatus } = usePremium();
  const { currentTheme, colors, setTheme } = useTheme();
  const { signOut, deleteAccount, user } = useAuth();
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [devModePremium, setDevModePremiumState] = useState(false);
  const [devModeActivated, setDevModeActivated] = useState(false);
  const [versionPressCount, setVersionPressCount] = useState(0);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const insets = useSafeAreaInsets();

  const themeOptions: { name: ThemeName; label: string; color: string }[] = [
    { name: 'rose', label: 'Rose', color: themes.rose.primary },
    { name: 'classic', label: 'Classic', color: themes.classic.primary },
    { name: 'forest', label: 'Forest', color: themes.forest.primary },
    { name: 'night', label: 'Night', color: themes.night.primary },
  ];

  // Load devmode status on mount and when user changes
  useEffect(() => {
    const loadDevModeStatus = async () => {
      if (!user) {
        // No user logged in, clear devmode state
        setDevModePremiumState(false);
        setDevModeActivated(false);
        return;
      }
      const [premiumValue, activatedValue] = await Promise.all([
        getDevModePremium(user.uid),
        getDevModeActivated(user.uid),
      ]);
      setDevModePremiumState(premiumValue);
      setDevModeActivated(activatedValue);
    };
    loadDevModeStatus();
  }, [user]);

  // Load notification status on mount
  useEffect(() => {
    const loadNotificationStatus = async () => {
      const enabled = await areNotificationsEnabled();
      setNotificationsEnabledState(enabled);
    };
    loadNotificationStatus();
  }, []);

  // Handle devmode premium toggle
  const handleDevModePremiumToggle = async (value: boolean) => {
    if (!user) return;
    await setDevModePremium(value, user.uid);
    setDevModePremiumState(value);
    // Refresh premium status to reflect the change
    await refreshPremiumStatus();
  };

  // Handle notification toggle
  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      // Request permissions first
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive daily reminders.',
        );
        return;
      }
    }
    
    try {
      await setNotificationsEnabled(value);
      setNotificationsEnabledState(value);
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
    }
  };

  const handleUpgradeToPremium = () => {
    router.push('/paywall');
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      const restored = await restore();
      if (restored) {
        showSuccessAlert('Your purchases have been restored!');
      } else {
        Alert.alert('No Purchases Found', 'We could not find any previous purchases to restore.');
      }
    } catch (error: any) {
      showPaymentError(error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePrivacyPolicy = () => {
    router.push('/privacy');
  };

  const handleTermsOfUse = () => {
    router.push('/terms');
  };

  const handleFAQ = () => {
    router.push('/faq');
  };

  const handleFeedback = () => {
    router.push('/feedback');
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await resetOnboarding();
              await signOut();
              router.replace('/signin');
            } catch (error: any) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This will permanently delete your account and all saved verses. This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteAccount();
              await resetOnboarding();
              router.replace('/onboarding');
            } catch (error: any) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handlePremiumSectionPress = () => {
    if (!isPremium) {
      handleUpgradeToPremium();
    }
  };

  // Get version from Constants, with fallbacks for different Expo versions
  const appVersion = 
    Constants.expoConfig?.version || 
    Constants.manifest?.version || 
    Constants.manifest2?.extra?.expoClient?.version || 
    '1.0.0';

  // Handle version text press for devmode activation
  const handleVersionPress = () => {
    const newCount = versionPressCount + 1;
    setVersionPressCount(newCount);
    
    if (newCount >= 7) {
      setShowCodeModal(true);
      setVersionPressCount(0); // Reset count
    }
  };

  // Handle code submission
  const handleCodeSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to activate devmode.');
      setCodeInput('');
      return;
    }
    const success = await activateDevMode(codeInput, user.uid);
    if (success) {
      setDevModeActivated(true);
      setShowCodeModal(false);
      setCodeInput('');
      showSuccessAlert('Devmode activated!');
    } else {
      Alert.alert('Incorrect Code', 'The code you entered is incorrect. Please try again.');
      setCodeInput('');
    }
  };

  // Handle code modal cancel
  const handleCodeModalCancel = () => {
    setShowCodeModal(false);
    setCodeInput('');
    setVersionPressCount(0);
  };

  // Handle reset welcome screen (dev only)
  const handleResetWelcome = async () => {
    await resetWelcome();
    router.replace('/(tabs)');
  };

  const settingsItems = [
    {
      id: '1',
      label: 'Privacy Policy',
      show: true,
      onPress: handlePrivacyPolicy,
    },
    {
      id: '2',
      label: 'Terms of Use',
      show: true,
      onPress: handleTermsOfUse,
    },
    {
      id: '3',
      label: 'FAQ',
      show: true,
      onPress: handleFAQ,
    },
    {
      id: '4',
      label: 'Feedback',
      show: true,
      onPress: handleFeedback,
    },
  ];

  const renderSettingItem = (item: typeof settingsItems[0], index: number, visibleItems: typeof settingsItems) => {
    if (!item.show) return null;

    const isLastItem = index === visibleItems.length - 1;

    return (
      <TouchableOpacity 
        key={item.id} 
        style={[
          styles.settingRow, 
          isLastItem && styles.settingRowLast
        ]} 
        onPress={item.onPress}
      >
        <Text style={styles.settingText}>{item.label}</Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  const visibleItems = settingsItems.filter(item => item.show);

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
          <Text style={styles.header}>Settings</Text>
        </View>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Premium Status Section */}
        <View style={styles.premiumSection}>
          <View style={styles.premiumSectionHeader}>
            <Text style={styles.premiumHeader}>Premium Status</Text>
            <TouchableOpacity
              style={styles.restoreButtonTopRight}
              onPress={handleRestorePurchases}
              disabled={isRestoring || isPremiumLoading}
              activeOpacity={0.7}
            >
              {isRestoring || isPremiumLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.restoreButtonText, { color: colors.primary }]}>
                  Restore Purchases
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[
              styles.premiumCard,
              !isPremium && styles.premiumCardClickable
            ]}
            onPress={handlePremiumSectionPress}
            disabled={isPremium}
            activeOpacity={0.7}
          >
            <View style={styles.premiumStatusRow}>
              <Text style={styles.premiumStatusLabel}>Status:</Text>
              <Text style={[styles.premiumStatusValue, { color: isPremium ? colors.primary : '#5C3A1E' }]}>
                {isPremium ? 'Premium' : 'Free'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Settings Menu Items */}
        <View style={styles.listContainer}>
          {visibleItems.map((item, index) => renderSettingItem(item, index, visibleItems))}
        </View>

        {/* Log Out Button */}
        <View style={styles.accountSection}>
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: colors.lighter }]}
            onPress={handleLogout}
            disabled={isLoggingOut}
            activeOpacity={0.7}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={colors.darker} />
            ) : (
              <Text style={[styles.logoutButtonText, { color: colors.darker }]}>Log Out</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Theme Picker Section */}
        <View style={styles.themeSection}>
          <Text style={styles.themeHeader}>Color Theme</Text>
          <View style={styles.themeCard}>
            <View style={styles.themeSwatches}>
              {themeOptions.map((theme) => (
                <TouchableOpacity
                  key={theme.name}
                  style={[
                    styles.themeSwatch,
                    currentTheme === theme.name && styles.themeSwatchSelected,
                    { borderColor: currentTheme === theme.name ? colors.primary : '#E8E4DD' },
                  ]}
                  onPress={() => setTheme(theme.name)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.themeColorCircle, { backgroundColor: theme.color }]} />
                  <Text style={styles.themeLabel}>{theme.label}</Text>
                  {currentTheme === theme.name && (
                    <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Notifications Section - Only show for free users */}
        {!isPremium && (
          <View style={styles.notificationsSection}>
            <Text style={styles.notificationsHeader}>Notifications</Text>
            <View style={styles.notificationsCard}>
              <View style={styles.notificationsRow}>
                <View style={styles.notificationsLabelContainer}>
                  <Text style={styles.notificationsLabel}>Daily Reminders</Text>
                  <Text style={styles.notificationsDescription}>
                    Get a daily reminder when your free verse is ready
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: '#E8E4DD', true: colors.primary }}
                  thumbColor={notificationsEnabled ? '#fff' : colors.darker}
                />
              </View>
            </View>
          </View>
        )}

        {/* Devmode Section - Only show if activated */}
        {devModeActivated && (
          <View style={styles.devmodeSection}>
            <Text style={styles.devmodeHeader}>Devmode</Text>
            <View style={styles.devmodeCard}>
              <View style={styles.devmodeRow}>
                <Text style={styles.devmodeLabel}>Premium Toggle</Text>
                <Switch
                  value={devModePremium}
                  onValueChange={handleDevModePremiumToggle}
                  trackColor={{ false: '#E8E4DD', true: colors.primary }}
                  thumbColor={devModePremium ? '#fff' : colors.darker}
                />
              </View>
              <View style={styles.devmodeDivider} />
              <TouchableOpacity
                style={styles.devmodeButtonRow}
                onPress={handleResetWelcome}
                activeOpacity={0.7}
              >
                <Text style={styles.devmodeLabel}>Reset Welcome Screen</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Delete Account Button */}
        <View style={styles.deleteAccountSection}>
          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            activeOpacity={0.7}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#A0522D" />
            ) : (
              <Text style={styles.deleteAccountText}>Delete Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer with Version */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleVersionPress} activeOpacity={0.7}>
            <Text style={styles.footerText}>Version {appVersion}</Text>
          </TouchableOpacity>
        </View>

        {/* Devmode Code Input Modal */}
        <Modal
          visible={showCodeModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCodeModalCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter Devmode Code</Text>
              <TextInput
                style={styles.codeInput}
                placeholder="Enter code..."
                placeholderTextColor="#9B8E7D"
                value={codeInput}
                onChangeText={setCodeInput}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
                secureTextEntry={false}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={handleCodeModalCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={handleCodeSubmit}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E9', // Warm parchment background
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scaleSpacing(20),
    paddingTop: 0,
  },
  headerContainer: {
    paddingTop: scaleSpacing(60),
    paddingBottom: scaleSpacing(20),
    paddingHorizontal: scaleSpacing(20),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleSpacing(20),
  },
  backButton: {
    paddingVertical: scaleSpacing(8),
    paddingHorizontal: scaleSpacing(12),
    marginRight: scaleSpacing(12),
  },
  backButtonText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
    color: '#5C3A1E', // Will be overridden by theme
  },
  header: {
    fontSize: scaleFontSize(28, 22),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36', // Warm dark grey
  },
  premiumSection: {
    marginBottom: scaleSpacing(32),
  },
  premiumSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSpacing(12),
  },
  premiumHeader: {
    fontSize: scaleFontSize(20, 17),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
  },
  restoreButtonTopRight: {
    paddingVertical: scaleSpacing(4),
    paddingHorizontal: scaleSpacing(8),
  },
  restoreButtonText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_600SemiBold',
    textDecorationLine: 'underline',
  },
  premiumCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(16),
    minHeight: scaleSpacing(60),
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  premiumCardClickable: {
    // Additional styling for clickable state could go here
  },
  premiumStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumStatusLabel: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
    marginRight: scaleSpacing(8),
  },
  premiumStatusValue: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
  },
  listContainer: {
    backgroundColor: '#FAF7F2', // Lighter parchment for card
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scaleSpacing(16),
    paddingHorizontal: scaleSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F1E9', // Subtle divider
    minHeight: scaleSpacing(56), // Ensure consistent touch target size
  },
  settingRowLast: {
    borderBottomWidth: 0, // Remove border from last item
  },
  settingRowDisabled: {
    opacity: 0.6,
  },
  settingText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36', // Warm dark grey
  },
  chevron: {
    fontSize: scaleFontSize(24, 20),
    fontFamily: 'Nunito_400Regular',
    color: '#5C3A1E', // Will be overridden by theme
  },
  themeSection: {
    marginTop: scaleSpacing(32),
  },
  themeHeader: {
    fontSize: scaleFontSize(20, 17),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(12),
  },
  themeCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeSwatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaleSpacing(12),
    padding: scaleSpacing(8),
  },
  themeSwatch: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: scaleSpacing(16),
    borderRadius: scaleSpacing(10),
    borderWidth: 2,
    borderColor: '#E8E4DD',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  themeSwatchSelected: {
    borderWidth: 2,
  },
  themeColorCircle: {
    width: scaleSpacing(40),
    height: scaleSpacing(40),
    borderRadius: scaleSpacing(20),
    marginBottom: scaleSpacing(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  themeLabel: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_600SemiBold',
    color: '#3E3A36',
  },
  checkmark: {
    position: 'absolute',
    top: scaleSpacing(8),
    right: scaleSpacing(8),
    width: scaleSpacing(24),
    height: scaleSpacing(24),
    borderRadius: scaleSpacing(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_700Bold',
  },
  devmodeSection: {
    marginTop: scaleSpacing(32),
  },
  devmodeHeader: {
    fontSize: scaleFontSize(20, 17),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(12),
  },
  devmodeCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  devmodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scaleSpacing(16),
    paddingHorizontal: scaleSpacing(16),
  },
  devmodeLabel: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
  },
  devmodeDivider: {
    height: 1,
    backgroundColor: '#F5F1E9',
    marginHorizontal: scaleSpacing(16),
  },
  devmodeButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scaleSpacing(16),
    paddingHorizontal: scaleSpacing(16),
  },
  notificationsSection: {
    marginTop: scaleSpacing(32),
  },
  notificationsHeader: {
    fontSize: scaleFontSize(20, 17),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(12),
  },
  notificationsCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scaleSpacing(16),
    paddingHorizontal: scaleSpacing(16),
  },
  notificationsLabelContainer: {
    flex: 1,
    marginRight: scaleSpacing(16),
  },
  notificationsLabel: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(4),
  },
  notificationsDescription: {
    fontSize: scaleFontSize(13, 11),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    lineHeight: scaleFontSize(18, 15),
  },
  footer: {
    marginTop: scaleSpacing(32),
    marginBottom: scaleSpacing(20),
    alignItems: 'center',
    paddingVertical: scaleSpacing(16),
  },
  footerText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    color: '#5C3A1E',
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scaleSpacing(20),
  },
  modalContent: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(16),
    padding: scaleSpacing(24),
    width: '100%',
    maxWidth: scaleSpacing(400),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: scaleFontSize(20, 18),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(20),
    textAlign: 'center',
  },
  codeInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSpacing(10),
    borderWidth: 1,
    borderColor: '#E8E4DD',
    padding: scaleSpacing(14),
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
    marginBottom: scaleSpacing(20),
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: scaleSpacing(12),
  },
  modalButton: {
    flex: 1,
    borderRadius: scaleSpacing(10),
    paddingVertical: scaleSpacing(12),
    paddingHorizontal: scaleSpacing(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#E8E4DD',
  },
  modalButtonText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
  },
  modalButtonTextCancel: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
    color: '#5C3A1E',
  },
  accountSection: {
    marginTop: scaleSpacing(32),
  },
  logoutButton: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(16),
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
  },
  deleteAccountSection: {
    marginTop: scaleSpacing(24),
    marginBottom: scaleSpacing(16),
  },
  deleteAccountButton: {
    padding: scaleSpacing(16),
    alignItems: 'center',
  },
  deleteAccountText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
    color: '#A0522D', // Muted red/warning color
  },
});
