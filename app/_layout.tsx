import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { PremiumProvider } from "../src/contexts/PremiumContext";
import { ThemeProvider } from "../src/contexts/ThemeContext";
import { View, StyleSheet, AppStateStatus, AppState } from "react-native";
import { LoadingSpinner } from "../src/components/LoadingSpinner";
import { useFonts } from "expo-font";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import {
  Lora_400Regular,
  Lora_400Regular_Italic,
  Lora_600SemiBold,
} from "@expo-google-fonts/lora";
import {
  initializePostHog,
  trackAppOpened as trackPostHogAppOpened,
} from "../src/services/posthog";
import { initTikTok, trackEvent } from "../src/services/tiktok";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

function AppContent() {
  const { isLoading } = useAuth();
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Lora_400Regular,
    Lora_400Regular_Italic,
    Lora_600SemiBold,
  });

  // Initialize analytics and track app opened
  useEffect(() => {
    const initAnalytics = async () => {
      try {
        // Initialize PostHog
        await initializePostHog();
        await trackPostHogAppOpened();
      } catch (error) {
        console.error("Error initializing PostHog:", error);
      }

      try {
        // Initialize TikTok SDK
        if (initTikTok && typeof initTikTok === "function") {
          initTikTok().catch((error: any) => {
            console.warn(
              "[RootLayout] TikTok initialization failed (non-critical):",
              error?.message,
            );
          });
        }
      } catch (error) {
        console.error("Error initializing TikTok SDK:", error);
      }
    };

    initAnalytics();
  }, []);

  useEffect(() => {
    let isFirstLaunch = true;
    let hasTrackedTikTokLaunch = false;

    AsyncStorage.getItem("@first_launch_completed")
      .then((value) => {
        if (!value) {
          isFirstLaunch = true;
          AsyncStorage.setItem("@first_launch_completed", "true");
        } else {
          isFirstLaunch = false;
        }
      })
      .catch(() => {
        isFirstLaunch = true;
      });

    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          // Track app opened
          isFirstLaunch = false; // Reset after first track

          if (!hasTrackedTikTokLaunch) {
            hasTrackedTikTokLaunch = true;
            try {
              if (trackEvent && typeof trackEvent === "function") {
                trackEvent("LaunchApplication", {}).catch(() => {});
              }
            } catch (_) {}
          }

        } else if (nextAppState === "background") {
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  if (isLoading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner fullScreen message="Initializing..." />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PremiumProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </PremiumProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F1E9", // Warm parchment background
  },
});
