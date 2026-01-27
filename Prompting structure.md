Phase 1: Project Setup

  Prompt 1.1 - Initialize Project

  Create a new React Native Expo project called "PocketVerse".

  Setup:
  - Use Expo managed workflow
  - TypeScript enabled
  - Basic folder structure: /src with /screens, /components, /services, /constants

  Install these packages:
  - expo-router for navigation
  - react-native-safe-area-context

  Create a basic App entry point that renders a blank home screen with the text "Pocket Verse" centered.

  Prompt 1.2 - Navigation Structure

  Set up expo-router navigation with these screens:

  /screens/HomeScreen.tsx - Main input screen
  /screens/ResultScreen.tsx - Shows the verse result
  /screens/SavedScreen.tsx - List of saved verses
  /screens/SettingsScreen.tsx - Basic settings
  /screens/PaywallScreen.tsx - Premium upgrade

  For now, each screen should just show its name as text. We will build them out later.

  Add a simple tab bar at bottom with: Home, Saved, Settings

  ---
  Phase 2: Core UI (No Functionality Yet)

  Prompt 2.1 - Home Screen Layout

  Build the HomeScreen layout:

  - Top: App logo/name "Pocket Verse" with a small dove or cross icon
  - Middle: Large text input box (multiline, placeholder: "What's on your heart today?")
  - Below input: Button "Find my verse"
  - Bottom: Small text showing "X of 3 free today"

  No functionality yet - just the visual layout. Use placeholder text. Keep styling minimal for now (we will style later).

  Prompt 2.2 - Result Screen Layout

  Build the ResultScreen layout:

  - Back button top left
  - Verse reference large (e.g., "Psalm 56:3")
  - Verse text in quotes, larger font
  - Divider line
  - Section header "Why this verse:"
  - Explanation text paragraph
  - Bottom row: [Save] [Share] [New verse] buttons

  Accept the verse data as route params for now. Use hardcoded placeholder content to test the layout.

  Prompt 2.3 - Saved Screen Layout

  Build the SavedScreen layout:

  - Header: "Saved Verses"
  - List of saved verse cards, each showing:
    - Verse reference (e.g. Psalm 23:1)
    - First line of verse text truncated
    - Date saved
  - Tapping a card navigates to ResultScreen with that verse
  - Empty state: "No saved verses yet" with icon

  Use hardcoded dummy data array for now (3-4 fake verses).

  Prompt 2.4 - Paywall Screen Layout

  Build the PaywallScreen layout:

  - Header: "Unlimited Verses"
  - Subheader: "Get comfort whenever you need it"
  - Feature list with checkmarks:
    - Unlimited daily verses
    - Save unlimited favorites
    - No ads ever
  - Two pricing buttons:
    - Monthly: $2.99/month
    - Yearly: $19.99/year (show "Save 45%" badge)
  - Small "Restore purchases" link at bottom
  - X button top right to dismiss

  No payment functionality yet - just layout.

  Prompt 2.5 - Settings Screen Layout

  Build the SettingsScreen layout:

  Simple list with these rows:
  - "Upgrade to Premium" (shows if not premium)
  - "Restore Purchases"
  - "About"
  - "Privacy Policy"
  - "Terms of Use"
  - "Contact Us"

  Each row is just text with chevron icon. No functionality yet.

  ---
  Phase 3: Firebase Setup

  Prompt 3.1 - Firebase Configuration

  Set up Firebase for the project:

  - Install firebase and react-native-firebase packages needed for:
    - Authentication (anonymous auth)
    - Firestore database

  - Create /src/services/firebase.ts with:
    - Firebase initialization
    - Export auth and firestore instances

  - Create a config file for Firebase credentials (use environment variables)

  Do not implement any auth or database logic yet - just the setup and initialization.

  Prompt 3.2 - Anonymous Auth

  Implement anonymous authentication:

  - When app opens, check if user is authenticated
  - If not, sign in anonymously
  - Store the user UID for later use
  - Create a simple auth context/hook: useAuth() that returns { user, isLoading }

  In App entry, wrap everything in AuthProvider. Show a loading spinner while auth initializes.

  Prompt 3.3 - Firestore Data Structure

  Set up Firestore structure and helper functions:

  Collection: users/{uid}
  - Document fields: createdAt, isPremium (boolean)

  Collection: users/{uid}/savedVerses
  - Document fields: verseReference, verseText, explanation, savedAt

  Create /src/services/firestore.ts with these functions:
  - createUserDocument(uid) - creates user doc if doesn't exist
  - getUserData(uid) - returns user document
  - saveVerse(uid, verseData) - adds to savedVerses collection
  - getSavedVerses(uid) - returns all saved verses
  - deleteVerse(uid, verseId) - removes a saved verse

  These should be simple CRUD functions.

  ---
  Phase 4: OpenAI Integration

  Prompt 4.1 - OpenAI Service Setup

  Set up OpenAI API integration:

  - Create /src/services/openai.ts
  - Function: getVerseForSituation(userInput: string) that:
    - Sends request to OpenAI API (use gpt-4o-mini for cost efficiency)
    - Uses this system prompt:

      "You are a compassionate Christian spiritual guide. The user will share what's troubling them. Your task is to respond with ONE Bible verse from the Christian Bible that speaks to their situation. Choose a verse that is encouraging, hopeful, and directly relevant. Avoid obscure or overly complex verses.

      Format your response as JSON:
      {
        "reference": "Psalm 23:4",
        "text": "The verse text here",
        "explanation": "2-3 sentences explaining why this verse applies to their situation. Keep tone warm and comforting, not preachy."
      }"

    - Parse the JSON response and return structured data
    - Handle errors gracefully

  Store API key in environment variable.

  Prompt 4.2 - Connect Home to AI

  Connect HomeScreen to OpenAI:

  - When user taps "Find my verse":
    - Show loading state on button
    - Call getVerseForSituation with input text
    - On success: navigate to ResultScreen with verse data as params
    - On error: show simple error alert

  - Disable button if input is empty
  - Clear input after successful submission

  Prompt 4.3 - Result Screen Functionality

  Make ResultScreen functional:

  - Receive verse data from route params (reference, text, explanation)
  - Display the actual data instead of placeholders
  - Save button:
    - Calls saveVerse() from firestore service
    - Shows toast/alert "Verse saved!"
    - Disable button if already saved
  - Share button:
    - Uses react-native share API
    - Shares: "{verse text}" - {reference}\n\nFrom Pocket Verse app
  - New verse button:
    - Navigates back to HomeScreen

  ---
  Phase 5: Usage Limits

  Prompt 5.1 - Daily Limit Tracking

  Implement daily usage limit tracking:

  - Create /src/services/usageTracker.ts
  - Use AsyncStorage to store:
    - dailyCount: number
    - lastResetDate: string (YYYY-MM-DD)

  - Functions:
    - getUsageToday(): returns current count
    - incrementUsage(): adds 1 to count
    - resetIfNewDay(): checks date, resets count to 0 if new day
    - canUseForFree(): returns boolean (count < 3)

  - On app open, call resetIfNewDay()

  Prompt 5.2 - Enforce Limits in UI

  Integrate usage limits into the app:

  - HomeScreen:
    - Show "X of 3 free today" using getUsageToday()
    - Before calling AI, check canUseForFree()
    - If can't use: navigate to PaywallScreen instead
    - After successful verse fetch: call incrementUsage()

  - Update the counter display after each use

  ---
  Phase 6: RevenueCat Payments

  Prompt 6.1 - RevenueCat Setup

  Set up RevenueCat for in-app purchases:

  - Install react-native-purchases
  - Create /src/services/purchases.ts
  - Initialize RevenueCat with API key on app start

  - Functions:
    - initializePurchases(): call on app start
    - getOfferings(): fetch available packages
    - purchasePackage(package): make purchase
    - restorePurchases(): restore previous purchases
    - checkPremiumStatus(): returns boolean

  - Create a PremiumContext that:
    - Tracks isPremium state
    - Loads premium status on app start
    - Provides upgrade and restore functions

  Prompt 6.2 - Paywall Functionality

  Make PaywallScreen functional:

  - On mount, fetch offerings from RevenueCat
  - Monthly button: purchases monthly package
  - Yearly button: purchases yearly package
  - After successful purchase:
    - Update premium context
    - Show success message
    - Navigate back/dismiss
  - Restore purchases link:
    - Calls restore function
    - If premium found: update context and dismiss
    - If not found: show "No purchases found" message
  - Handle loading and error states

  Prompt 6.3 - Premium Unlocks

  Integrate premium status throughout app:

  - Usage tracking:
    - If isPremium: skip limit check, don't show counter
  - HomeScreen:
    - Hide "X of 3 free today" for premium users
  - SettingsScreen:
    - Hide "Upgrade to Premium" row for premium users
  - SavedScreen:
    - No changes needed (saving works for all)

  ---
  Phase 7: Saved Verses

  Prompt 7.1 - Saved Screen Functionality

  Make SavedScreen functional:

  - On mount, fetch saved verses from Firestore
  - Display in FlatList with verse cards
  - Tapping card navigates to ResultScreen with that verse's data
  - Add pull-to-refresh
  - Handle loading state
  - Handle empty state (no verses saved yet)

  Prompt 7.2 - Delete Saved Verses

  Add delete functionality to saved verses:

  - Swipe to delete on verse cards, OR
  - Long press to show delete option
  - Confirm dialog before deleting
  - Call deleteVerse() from firestore
  - Update list after deletion

  ---
  Phase 8: Polish Features

  Prompt 8.1 - Loading States

  Add proper loading states throughout:

  - HomeScreen: loading spinner on button while fetching verse
  - ResultScreen: skeleton/placeholder while loading (if needed)
  - SavedScreen: loading spinner while fetching verses
  - PaywallScreen: loading while fetching offerings and processing purchase

  Use a consistent loading spinner component.

  Prompt 8.2 - Error Handling

  Add error handling throughout:

  - OpenAI errors: show friendly message "Something went wrong. Please try again."
  - Network errors: detect offline state, show "No internet connection"
  - Firestore errors: handle gracefully with retry option
  - Payment errors: show specific error message from RevenueCat

  Create a simple error alert helper function for consistency.

  Prompt 8.3 - Share Card

  Improve the share functionality:

  - Instead of plain text, generate a shareable image card:
    - Verse reference at top
    - Verse text in elegant typography
    - App name/logo watermark at bottom

  - Use react-native-view-shot to capture the card as image
  - Share the image instead of text

  (Optional - can skip for MVP and use text sharing)

  ---
  Phase 9: Settings & Legal

  Prompt 9.1 - Settings Functionality

  Make SettingsScreen functional:

  - "Upgrade to Premium": navigates to PaywallScreen
  - "Restore Purchases": calls restore function, shows result
  - "About": shows modal with app version, brief description
  - "Privacy Policy": opens URL in browser
  - "Terms of Use": opens URL in browser
  - "Contact Us": opens email compose with support email

  All rows should have proper onPress handlers.

  ---
  What's NOT Included (Add Later)

  - Notifications / daily reminders
  - Onboarding screens
  - Analytics
  - Push notifications
  - Social features
  - Verse of the day
  - Styling / theming (separate phase)
