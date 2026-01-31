import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { useTheme } from '../src/contexts/ThemeContext';
import { X, BookOpen, MessageCircle, Bookmark, Book } from 'react-native-feather';
import Svg, { Path } from 'react-native-svg';
import { getOfferings, purchasePackage } from '../src/services/purchases';
import type { PurchasesPackage } from 'react-native-purchases';
import { usePremium } from '../src/contexts/PremiumContext';
import { trackPurchased } from '../src/services/posthog';
import { trackPurchased as trackTikTokPurchased } from '../src/services/tiktok';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const REVENUECAT_MONTHLY_ID = '$rc_monthly';
const REVENUECAT_ANNUAL_ID = '$rc_annual';

function findMonthlyPackage(packages: PurchasesPackage[]): PurchasesPackage | null {
  return (
    packages.find((pkg) => pkg.identifier === REVENUECAT_MONTHLY_ID) ??
    packages.find((pkg) => pkg.identifier.toLowerCase().includes('monthly')) ??
    null
  );
}

function findAnnualPackage(packages: PurchasesPackage[]): PurchasesPackage | null {
  return (
    packages.find((pkg) => pkg.identifier === REVENUECAT_ANNUAL_ID) ??
    packages.find(
      (pkg) =>
        pkg.identifier.toLowerCase().includes('yearly') ||
        pkg.identifier.toLowerCase().includes('annual')
    ) ??
    null
  );
}

/**
 * Feature-focused paywall shown when free users hit premium features in the app
 * (unlimited verses, deep reflections, saved verses, Bible navigation).
 * Onboarding flow uses paywall-3 instead.
 */
export default function OnboardingPaywall4Screen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { refreshPremiumStatus } = usePremium();
  const [monthlyPkg, setMonthlyPkg] = useState<PurchasesPackage | null>(null);
  const [annualPkg, setAnnualPkg] = useState<PurchasesPackage | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<'monthly' | 'annual'>('annual');
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const handleDismiss = () => {
    router.back();
  };

  const handlePurchase = async () => {
    const pkg = selectedPackage === 'annual' ? annualPkg : monthlyPkg;
    if (!pkg) return;
    try {
      setPurchasing(true);
      await purchasePackage(pkg);
      await trackPurchased(pkg.identifier, pkg.product?.price, false);
      await trackTikTokPurchased();
      await refreshPremiumStatus();
      router.back();
    } catch (error: any) {
      console.error('Purchase error:', error);
    } finally {
      setPurchasing(false);
    }
  };

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const offering = await getOfferings();
        if (offering?.availablePackages?.length) {
          const monthly = findMonthlyPackage(offering.availablePackages);
          const annual = findAnnualPackage(offering.availablePackages);
          setMonthlyPkg(monthly ?? null);
          setAnnualPkg(annual ?? null);
          if (annual && !monthly) setSelectedPackage('annual');
          else if (monthly && !annual) setSelectedPackage('monthly');
        }
      } catch (error) {
        console.error('Error fetching offerings:', error);
      } finally {
        setLoadingPrice(false);
      }
    };
    fetchOfferings();
  }, []);

  const closeIconSize = scaleIconSize(24);
  const stepIconSize = scaleIconSize(24);

  return (
    <View style={styles.container}>
      <View style={[styles.closeButtonContainer, { paddingTop: Math.max(insets.top, scaleSpacing(20)) }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleDismiss}
          activeOpacity={0.7}
        >
          <X width={closeIconSize} height={closeIconSize} color="#F5F0E8" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topSection, { backgroundColor: colors.primary }]} />

        <View style={[styles.dividerContainer, { backgroundColor: colors.primary }]}>
          <Svg width={SCREEN_WIDTH} height={scaleSpacing(80)} style={styles.dividerSvg}>
            <Path
              d={`M 0 ${scaleSpacing(80)} Q ${SCREEN_WIDTH / 2} ${-scaleSpacing(28)} ${SCREEN_WIDTH} ${scaleSpacing(80)} L ${SCREEN_WIDTH} ${scaleSpacing(80)} L 0 ${scaleSpacing(80)} Z`}
              fill="#F5F0E8"
            />
          </Svg>
        </View>

        <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, scaleSpacing(20)) }]}>
          <Text style={styles.title}>Unlock All Features</Text>

          <View style={styles.timelineContainer}>
            <View style={styles.stepContainer}>
              <View style={[styles.stepIcon, { backgroundColor: colors.primary }]}>
                <BookOpen width={stepIconSize} height={stepIconSize} color="#F5F0E8" strokeWidth={2.5} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Unlimited verses</Text>
                <Text style={styles.stepDescription}>
                  No daily limit. Get a verse whenever you need one.
                </Text>
              </View>
            </View>

            <View style={styles.stepContainer}>
              <View style={[styles.stepIcon, { backgroundColor: colors.primary }]}>
                <MessageCircle width={stepIconSize} height={stepIconSize} color="#F5F0E8" strokeWidth={2.5} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Deep Reflections</Text>
                <Text style={styles.stepDescription}>
                  See why each verse was chosen for you with personalized reflections.
                </Text>
              </View>
            </View>

            <View style={styles.stepContainer}>
              <View style={[styles.stepIcon, { backgroundColor: colors.primary }]}>
                <Bookmark width={stepIconSize} height={stepIconSize} color="#F5F0E8" strokeWidth={2.5} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Saved verses</Text>
                <Text style={styles.stepDescription}>
                  Build and revisit your personal collection anytime.
                </Text>
              </View>
            </View>

            <View style={styles.stepContainer}>
              <View style={[styles.stepIcon, { backgroundColor: colors.primary }]}>
                <Book width={stepIconSize} height={stepIconSize} color="#F5F0E8" strokeWidth={2.5} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Full Bible navigation</Text>
                <Text style={styles.stepDescription}>
                  Jump to any book, chapter, and verse in the full text.
                </Text>
              </View>
            </View>
          </View>

          {/* Monthly / Annual options */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedPackage === 'monthly' && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelectedPackage('monthly')}
              activeOpacity={0.8}
              disabled={loadingPrice || !monthlyPkg}
            >
              <Text style={styles.optionTitle}>Monthly</Text>
              {monthlyPkg?.product ? (
                <>
                  <Text style={styles.optionPrice}>
                    {monthlyPkg.product.currencyCode && monthlyPkg.product.price
                      ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: monthlyPkg.product.currencyCode,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(monthlyPkg.product.price)
                      : monthlyPkg.product.priceString}
                  </Text>
                  <Text style={styles.optionSubtitle}>per month</Text>
                </>
              ) : (
                <Text style={styles.optionPrice}>{loadingPrice ? '...' : '—'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                styles.optionCardAnnual,
                selectedPackage === 'annual' && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelectedPackage('annual')}
              activeOpacity={0.8}
              disabled={loadingPrice || !annualPkg}
            >
              <View style={[styles.trialBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.trialBadgeText}>3 days free trial</Text>
              </View>
              <View style={styles.optionCardContent}>
                <Text style={styles.optionTitle}>Annual</Text>
              {annualPkg?.product ? (
                <>
                  <Text style={styles.optionPrice}>
                    {annualPkg.product.currencyCode && annualPkg.product.price
                      ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: annualPkg.product.currencyCode,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(annualPkg.product.price)
                      : annualPkg.product.priceString}
                  </Text>
                  <Text style={styles.optionSubtitle}>
                    *That's{' '}
                    {annualPkg.product.currencyCode &&
                      annualPkg.product.price &&
                      new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: annualPkg.product.currencyCode,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(annualPkg.product.price / 12)}
                    /mo
                  </Text>
                </>
              ) : (
                <Text style={styles.optionPrice}>{loadingPrice ? '...' : '—'}</Text>
              )}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { shadowColor: colors.primary, borderColor: colors.primary, backgroundColor: colors.primary }]}
              onPress={handlePurchase}
              activeOpacity={0.8}
              disabled={purchasing || loadingPrice || !(selectedPackage === 'annual' ? annualPkg : monthlyPkg)}
            >
              <Text style={[styles.buttonText, { color: '#F5F0E8' }]}>
                {purchasing
                  ? 'Processing...'
                  : loadingPrice
                  ? 'Loading...'
                  : selectedPackage === 'annual'
                  ? 'Try for free'
                  : selectedPackage === 'monthly' && monthlyPkg?.product?.currencyCode && monthlyPkg?.product?.price
                  ? `Try for ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: monthlyPkg.product.currencyCode,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(monthlyPkg.product.price)}`
                  : 'Try for free'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
              <Text style={styles.footerLink}>Restore Purchases</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator}> • </Text>
            <TouchableOpacity onPress={() => router.push('/terms')}>
              <Text style={styles.footerLink}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator}> • </Text>
            <TouchableOpacity onPress={() => router.push('/privacy')}>
              <Text style={styles.footerLink}>Privacy</Text>
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
    backgroundColor: '#F5F0E8',
  },
  scrollContent: {
    flexGrow: 1,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    paddingRight: scaleSpacing(20),
  },
  closeButton: {
    padding: scaleSpacing(8),
  },
  topSection: {
    height: scaleSpacing(56),
  },
  dividerContainer: {
    height: scaleSpacing(80),
    overflow: 'hidden',
  },
  dividerSvg: {
    position: 'absolute',
    bottom: 0,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    paddingHorizontal: scaleSpacing(24),
    paddingTop: scaleSpacing(30),
  },
  title: {
    fontSize: scaleFontSize(28, 24),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    textAlign: 'center',
    marginBottom: scaleSpacing(4),
  },
  timelineContainer: {
    marginBottom: scaleSpacing(24),
    marginTop: scaleSpacing(8),
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: scaleSpacing(16),
  },
  stepIcon: {
    width: scaleSpacing(48),
    height: scaleSpacing(48),
    borderRadius: scaleSpacing(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaleSpacing(16),
  },
  stepContent: {
    flex: 1,
    paddingTop: scaleSpacing(4),
  },
  stepTitle: {
    fontSize: scaleFontSize(18, 16),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(4),
  },
  stepDescription: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    lineHeight: scaleFontSize(22, 18),
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSpacing(12),
    marginBottom: scaleSpacing(20),
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#E8E4DC',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(14),
    borderWidth: 1,
    borderColor: '#D0CBC0',
  },
  optionCardAnnual: {
    paddingTop: scaleSpacing(28),
    paddingBottom: scaleSpacing(14),
    paddingHorizontal: scaleSpacing(14),
    minHeight: scaleSpacing(128),
  },
  optionCardContent: {
    paddingTop: scaleSpacing(14),
  },
  trialBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: scaleSpacing(12),
    borderTopRightRadius: scaleSpacing(12),
    paddingVertical: scaleSpacing(6),
    alignItems: 'center',
  },
  trialBadgeText: {
    fontSize: scaleFontSize(12, 10),
    fontFamily: 'Nunito_600SemiBold',
    color: '#F5F0E8',
  },
  optionTitle: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(4),
  },
  optionPrice: {
    fontSize: scaleFontSize(18, 16),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
  },
  optionSubtitle: {
    fontSize: scaleFontSize(12, 10),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    marginTop: scaleSpacing(2),
  },
  buttonContainer: {
    width: '100%',
    marginBottom: scaleSpacing(16),
  },
  button: {
    borderRadius: scaleSpacing(12),
    paddingVertical: scaleSpacing(16),
    paddingHorizontal: scaleSpacing(24),
    alignItems: 'center',
    borderWidth: 0,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonText: {
    fontSize: scaleFontSize(18, 16),
    fontFamily: 'Nunito_600SemiBold',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerLink: {
    fontSize: scaleFontSize(13, 11),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    textDecorationLine: 'underline',
  },
  footerSeparator: {
    fontSize: scaleFontSize(13, 11),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    marginHorizontal: scaleSpacing(8),
  },
});
