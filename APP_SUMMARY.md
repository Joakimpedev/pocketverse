# Pocket Verse: App Summary

## 1. App Concept

**Pocket Verse** is a mobile application designed to provide spiritual comfort and guidance. Users describe their feelings or situations, and the app uses an AI to find a relevant Bible verse from the entire Christian Bible that speaks to their emotional state. It's a digital spiritual guide for modern users seeking solace in scripture.

## 2. Core User Flow

1.  **Input:** On the **Home Screen**, the user is prompted to write "What's on your heart today?" in a text box.
2.  **AI Analysis:** Upon tapping "Find my verse," the user's input is sent to an OpenAI model. The AI is instructed to act as a compassionate spiritual guide and return a single, fitting Bible verse, its reference, and a brief, comforting explanation.
3.  **Display:** The app navigates to the **Result Screen**, where the verse, reference, and explanation are displayed.
4.  **Action:** From the Result Screen, the user can:
    *   **Save** the verse to their personal collection.
    *   **Share** the verse with others.
    *   Go back to the Home Screen to get a **new verse**.

## 3. Key Features

*   **AI-Powered Verse Finder:** Utilizes OpenAI (GPT-4o-mini) to provide contextually relevant Bible verses based on user input.
*   **Saved Verses:** Users can save their favorite verses, which are stored in a personalized list (the **Saved Screen**) for later access. Users can also delete saved verses.
*   **Share Functionality:** Allows users to share a verse and its reference through their device's native share options.
*   **Usage Limits:** A freemium model that grants non-paying users 3 free verse lookups per day.
*   **Premium Subscription:** A paywall offers unlimited daily verses and an ad-free experience for a monthly or yearly fee.
*   **User Authentication:** Uses anonymous Firebase authentication to create a unique profile for each user to store their saved verses and premium status.
*   **Settings:** A standard settings screen providing access to purchase restoration, legal documents (Privacy Policy, Terms of Use), and contact information.

## 4. Monetization Model

The app uses a **freemium** model, managed by RevenueCat.

*   **Free Tier:**
    *   3 verse generations per day.
*   **Premium Tier (Paid):
    *   Unlimited daily verse generations.
    *   Save unlimited favorite verses.
    *   Ad-free experience.
    *   Available as a monthly or yearly subscription.

## 5. Technical Architecture

*   **Framework:** React Native with Expo (Managed Workflow).
*   **Language:** TypeScript.
*   **Navigation:** `expo-router` for file-based routing and a bottom tab bar.
*   **Backend & Database:** Google Firebase.
    *   **Authentication:** Anonymous auth to manage user identity.
    *   **Database:** Firestore to store user data (`isPremium`) and their collection of `savedVerses`.
*   **AI Service:** OpenAI API (`gpt-4o-mini`) for the core verse-finding logic.
*   **In-App Purchases:** `react-native-purchases` (RevenueCat) to manage subscriptions and unlock premium features.
*   **Local Storage:** `AsyncStorage` for tracking the daily usage count for free users.
