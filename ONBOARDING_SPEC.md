# Pocket Verse - Onboarding Flow Specification

## Strategy

**Flow:** Onboarding → Paywall → (X dismiss) → 1 Free Verse

**Goal:** Optimize for initial conversion. User decides to pay or not within the session. Non-payers still get value via 1 free verse daily.

**Total Screens:** 12 (Hero → Name → Interstitial 1 → Age → Bible → Struggles → Seeking → Interstitial 2 → Theme+Verse Preview → Paywall 1 → Paywall 2 → Paywall 3)

**No login in onboarding** - Login prompted later after user engagement (e.g., after saving 3-5 verses)

**No notifications** - App is reactive ("come when you need a verse"), not proactive. May add later.

---

## Assets

- **Logo:** `assets/book_logo/rose.png` (transparent, used as visual anchor on question screens and hero)
- **Book open logo:** `assets/book_logo/book_open.png` (used on Interstitial 1 and Interstitial 2)
- **Theme logos:** `classic.png`, `forest.png`, `night.png`, `rose.png` (per-theme book logo on question screens and paywall)
- **Theme colors:** Classic, Forest, Night, Rose (burgundy)

---

## Verse Selection Logic

Simple logic based on **Screen 7** (What are you searching for?) answer only. Six options are shown in the UI; each maps to one verse shown on Screen 8 and Screen 9.

| User selects | Verse shown on Screen 8 & 9 |
|--------------|----------------------------|
| Comfort in hard times | **Psalm 34:18** - "The Lord is close to the brokenhearted and saves those who are crushed in spirit." |
| Peace for my mind | **Isaiah 26:3** - "You will keep in perfect peace those whose minds are steadfast, because they trust in you." |
| Hope for the future | **Jeremiah 29:11** - "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." |
| Strength to keep going | **Isaiah 40:31** - "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint." |
| Calm in the chaos | **Psalm 46:10** - "Be still, and know that I am God." |
| Direction and purpose | **Proverbs 3:5-6** - "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." |

---

## Screen-by-Screen Breakdown

---

### Screen 1: Hero Welcome

**Type:** Welcome

**Layout:**
- Book logo (centered, with subtle glow)
- App name: "Pocket Verse"
- Tagline: "The right verse for right now"
- CTA button: "Get Started"

**No progress bar**

---

### Screen 2: Name Input

**Type:** Text input

**Layout:**
- Progress bar (~10%)
- Book logo
- Question: "What should we call you?"
- Text input field
- CTA: "Continue"

**Required**

---

### Screen 3: Interstitial 1

**Type:** Educational / Transition

**Layout:**
- No progress bar
- Book open logo (`assets/book_logo/book_open.png`)
- Verse: "You have searched me, Lord, and you know me." — Psalm 139:1
- Divider (animated)
- Tagline: "God's Word has something for exactly where you are."
- CTA: "Next"

---

### Screen 4: Age

**Type:** Single-select

**Layout:**
- Progress bar (~30%)
- Book logo
- Question: "How old are you?"
- Options:
  - 18-24
  - 25-34
  - 35-44
  - 45-54
  - 55+

**Required**

---

### Screen 5: Bible Familiarity

**Type:** Single-select

**Layout:**
- Progress bar (~40%)
- Book logo
- Question: "How familiar are you with the Bible?" (or "How familiar are you with the Bible, {name}?" if name was provided)
- Options:
  - "I'm just starting to explore"
  - "I know some verses"
  - "I read it regularly"

**Required**

---
### Screen 6: Struggles

**Type:** Multi-select

**Layout:**
- Progress bar (~50%)
- Book logo
- Question: "What are you carrying right now?"
- Instruction: "Pick a few that resonate"
- Options:
  - Fear & Worry
  - Stress from work or school
  - Relationship struggles
  - Grief or loss
  - Health concerns
  - Doubt or uncertainty
  - Loneliness
  - Feeling overwhelmed
  - Anger or frustration
- CTA: "Continue"

**Required** - minimum 1 selection

---
### Screen 7: What Brings You Here

**Type:** Single-select

**Purpose:** This answer determines the verse shown on Screen 8 (Interstitial)

**Layout:**
- Progress bar (~60%)
- Book logo
- Question: "What are you searching for?"
- Instruction: "Pick what resonates most"
- Options (single-select, 6 options; maps to verse on Screen 8 and 9):

| Option | Symbol | Maps to |
|--------|--------|---------|
| Comfort in hard times | 🕊️ | Psalm 34:18 |
| Peace for my mind | ☁️ | Isaiah 26:3 |
| Hope for the future | 🌅 | Jeremiah 29:11 |
| Strength to keep going | 🛡️ | Isaiah 40:31 |
| Calm in the chaos | 🌊 | Psalm 46:10 |
| Direction and purpose | 🧭 | Proverbs 3:5-6 |

The option chosen determines the verse shown on the next screen (Screen 8) and on the combined Theme + Verse Preview (Screen 9).

---
### Screen 8: Interstitial 2 (Verse from Screen 7)

**Type:** Educational / Transition

**Layout:**
- No progress bar
- Book open logo (`assets/book_logo/book_open.png`)
- Verse text and reference (from Screen 7 selection; see verse mapping above)
- Animated divider
- Tagline (per-verse tagline; see list below)
- CTA: "Next"

**Navigation:** Next → Screen 9 (Theme + Verse Preview).

6 options in UI → 6 verses (verse data also includes "Rest for my soul" and "Freedom from worry" for future use; not shown in Screen 7 picker).

Option: Comfort in hard times
  Symbol: 🕊️
  Verse: Psalm 34:18 - "The Lord is close to the brokenhearted and saves those who are crushed in
  spirit."
  Tagline: "Even in your hardest moments, God is right there with you."
  Input Text: "I'm going through a really difficult season right now"
  Deeper Reflection: "When life breaks us down, we often feel most alone. But this verse reveals a
  beautiful truth: God draws nearest when we're at our lowest. Your pain is not invisible to Him. You
  don't need to be strong or have it together — just as you are, He is there."
  ────────────────────────────────────────
  Option: Peace for my mind
  Symbol: ☁️
  Verse: Isaiah 26:3 - "You will keep in perfect peace those whose minds are steadfast, because they
  trust in you."
  Tagline: "When your thoughts race, ask God, and He will provide stillness."
  Input Text: "My mind won't stop racing and I can't find peace"
  Deeper Reflection: "The phrase 'perfect peace' in Hebrew is 'shalom shalom' — peace doubled,
  complete wholeness. This verse reminds us that peace isn't found by trying harder to calm our
  thoughts, but by anchoring them on God. Peace comes not from controlling everything, but from
  trusting the One who does."
  ────────────────────────────────────────
  Option: Hope for the future
  Symbol: 🌅
  Verse: Jeremiah 29:11 - "For I know the plans I have for you, declares the Lord, plans to prosper
  you and not to harm you, plans to give you hope and a future."
  Tagline: "God is already writing the next chapter for you."
  Input Text: "I feel uncertain about what's ahead for me"
  Deeper Reflection: "These words were spoken to people in exile — displaced and wondering if God had
  forgotten them. Into that uncertainty, God spoke: I have plans for you. The future may be unclear to
   you, but it is not unclear to God. Your story is not over."
  ────────────────────────────────────────
  Option: Strength to keep going
  Symbol: 🛡️
  Verse: Isaiah 40:31 - "But those who hope in the Lord will renew their strength. They will soar on
  wings like eagles; they will run and not grow weary, they will walk and not be faint."
  Tagline: "When you feel weak, ask God, and He will provide strength."
  Input Text: "I'm exhausted and don't know how to keep going"
  Deeper Reflection: "The word 'renew' here means to exchange — trading your worn-out strength for
  God's unlimited supply. Sometimes strength looks like soaring; other times it's just putting one
  foot in front of the other. Both are victories. You don't have to manufacture strength — just wait
  on Him."
  ────────────────────────────────────────
  Option: Calm in the chaos
  Symbol: 🌊
  Verse: Psalm 46:10 - "Be still, and know that I am God."
  Tagline: "In the middle of the storm, let God be your anchor."
  Input Text: "Everything around me feels chaotic and out of control"
  Deeper Reflection: "In Hebrew, 'be still' means 'let go' or 'cease striving.' It's not about being
  motionless — it's about releasing your grip on control. You can be still because God is not. He is
  working, even when you can't see it. He was God before this chaos, and He will be God after."
  ────────────────────────────────────────
  Option: Direction and purpose
  Symbol: 🧭
  Verse: Proverbs 3:5-6 - "Trust in the Lord with all your heart and lean not on your own
  understanding; in all your ways submit to him, and he will make your paths straight."
  Tagline: "When the path feels unclear, let God light the way."
  Input Text: "I don't know which direction to go in my life"
  Deeper Reflection: "We often want God to show us the entire map before we take a step. But this
  verse invites us into something different: trust first, clarity follows. When you acknowledge God in
   your decisions, He promises to straighten your path — not always the one you expected, but the one
  you need."
  ────────────────────────────────────────
  Option: Rest for my soul (verse data present; not in Screen 7 picker)
  Symbol: 🌙
  Verse: Matthew 11:28 - "Come to me, all you who are weary and burdened, and I will give you rest."
  Tagline: "When you're weary, ask God, and He will bury your unrest."
  Input Text: "I'm carrying so much and I just need rest"
  Deeper Reflection: "Jesus doesn't say 'figure it out' or 'try harder.' He says 'come.' The rest He
  offers is soul-deep — from no longer carrying burdens you were never meant to bear alone. He doesn't
   ask you to clean up first. Just come as you are, and exchange your exhaustion for His peace."
  ────────────────────────────────────────
  Option: Freedom from worry (verse data present; not in Screen 7 picker)
  Symbol: 🍃
  Verse: 1 Peter 5:7 - "Cast all your anxiety on him because he cares for you."
  Tagline: "When life's burden is heavy, ask God, and He will help you carry."
  Input Text: "I can't stop worrying about everything"
  Deeper Reflection: "The word 'cast' here means to throw, to hurl — not a gentle suggestion, but an
  invitation to aggressively offload every anxious thought onto God. Why? Because He cares for you.
  Worry says you're alone. This verse says the opposite: Someone stronger is ready to carry what you
  cannot."

---

### Screen 9: Theme + Verse Preview (combined)

**Type:** Visual selection + Preview / Confirmation

**Purpose:** Pick theme and see personalized verse in that theme before paywall. Implemented as one screen (`onboarding-theme-preview`).

**Layout:**
- Progress bar (~80%)
- Label: "Choose your color"
- 4 theme swatches (Classic, Forest, Night, Rose) with primary/darker/lighter preview
- Header: Pocket Verse logo, app name, tagline "The right verse for right now"
- Read-only input showing the "input text" for the chosen verse (e.g. "I'm going through a really difficult season right now")
- Verse card in selected theme colors: reference, "Read full chapter" link, verse text
- Expandable "Deep Reflection" section (same content as in Screen 8 verse data)
- CTA: "Looks beautiful"

**Required:** User must select a theme; verse is from Screen 7. **Navigation:** Next → Screen 10 (Paywall 1).

---

### Screen 10: Paywall - Trial Offer

**Type:** Paywall

**Layout:**
- **X button (top right)** - dismissible → goes to `/(tabs)` (main app)
- Top section in user's theme color with book logo (with glow)
- Circular divider into cream bottom section
- Headline: "We offer **3 days** of premium access, just for you"
- Reassurance: "No Payment Due Now"
- CTA: "Try now for free" or "Try now for [currency]0.00" (from RevenueCat)
- **Continue** → Screen 11

---

### Screen 11: Paywall - Reminder

**Type:** Paywall

**Layout:**
- X button (top right) → `/(tabs)`
- Theme-colored top section with bell icon (🔔)
- Circular divider
- Text: "We'll send you a reminder **1 day** before your trial ends"
- Reassurance: "No Payment Due Now"
- CTA: "Continue for FREE" → Screen 12

---

### Screen 12: Paywall - How It Works

**Type:** Paywall (final)

**Layout:**
- X button (top right) → marks onboarding complete, goes to `/(tabs)`
- Headline: "How your free trial works"
- Subheadline: "Nothing will be charged today"
- Timeline:
  - **Today - Begin your journey** — 3 days of full access, completely free
  - **Day 2 - Trial reminder** — Your trial ends soon, we'll remind you with a notification
  - **Day 3 - Stay blessed** — Continue with full access or cancel anytime
- CTA: "Try for free" (triggers purchase flow; on success or cancel, onboarding marked complete and user goes to `/(tabs)`)
- Price disclosure below button (e.g. "[currency]/month, billed yearly as [price]/year")
- Footer links: Restore Purchases | Terms | Privacy

---

### Dismiss → Free Experience

If user dismisses any paywall (X button), they go to the main app `/(tabs)` (home). On Screen 12 (Paywall 3), dismissing also calls `setOnboardingComplete()`. Non-payers get 1 free verse daily; the home experience explains this.

---

## Data Collected

| Screen | Data | Used for |
|--------|------|----------|
| 2 | Name | Personalization (future use) |
| 4 | Age | Analytics / Segmentation |
| 5 | Bible familiarity | Tone calibration (future) |
| 6 | Struggles | Keywords shown on Screen 10 |
| 7 | What brings you here (verseKey) | **Verse selection on Screen 8 & 9** |
| 9 | Theme | Chosen on Screen 9; applied to verse card and app theme |

---

## Design System

### Colors

| Element | Color | Hex |
|---------|-------|-----|
| Background (top section) | Cream | #F5F0E8 |
| Background (bottom section) | Dark Burgundy | #6a2e41 |
| Primary button (on burgundy) | Cream | #F5F0E8 |
| Button text (on cream) | Dark Burgundy | #6a2e41 |
| Button text (on burgundy) | Cream | #F5F0E8 |
| Body text (on cream) | Dark charcoal | #2D2D2D |
| Body text (on burgundy) | Cream | #F5F0E8 |
| Progress bar fill | Dark Burgundy | #6a2e41 |
| Progress bar track | Light tan | #E5DDD3 |
| Option cards | White | #FFFFFF |
| Option card border | Light gray | #E0D8CF |
| Selected option border | Dark Burgundy | #6a2e41 |
| Selected option background | Light burgundy tint | #F5EDEF |
| Logo glow | Dark Burgundy | #6a2e41 (15% opacity) |

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| App name (hero) | Serif (Lora) | Semi-bold | 37px (scaled) |
| Headlines/Questions | Serif (Lora) | Semi-bold | 24-28px |
| Tagline | Sans-serif (Nunito) | Regular | 16px |
| Award text | Sans-serif (Nunito) | Regular/Bold | 16px |
| Option text | Sans-serif (Nunito) | Regular | 16-18px |
| Button text | Sans-serif (Nunito) | Semi-bold | 16px |
| Interstitial text | Serif (Lora) | Regular or Italic | 22-24px |
| Small labels/taglines | Sans-serif (Nunito) | Regular | 14px |

### Option Cards (Full Width)

```
┌──────────────────────────────────────┐
│                                      │
│   🕊️  I need comfort in hard times   │
│                                      │
└──────────────────────────────────────┘
```

- Rounded corners: 12-16px radius
- Subtle shadow or light border
- Padding: 16-20px vertical, 16px horizontal
- Symbol on left, text after
- Full width with side margins (16-24px from screen edge)

**Selected state:**
- Burgundy border (2px)
- Light burgundy background tint
- Optional: checkmark icon on right

### Symbols for Options (Tasteful, No Face Emojis)

**Screen 5 - Bible Familiarity:**
- 🌱 "I'm just starting to explore"
- 📖 "I know some verses"
- ✝️ "I read it regularly"

**Screen 7 - What brings you here:**
- 🕊️ Comfort in hard times
- ☁️ Peace for my mind
- 🌅 Hope for the future
- 🛡️ Strength to keep going
- 🌊 Calm in the chaos
- 🧭 Direction and purpose

**Screen 6 - Struggles:**
- ⛈️ Fear & Worry
- ⚡ Stress from work or school
- 💔 Relationship struggles
- 🖤 Grief or loss
- 🩹 Health concerns
- ❓ Doubt or uncertainty
- 🌑 Loneliness
- 🌊 Feeling overwhelmed
- 🔥 Anger or frustration

**Screen 4 - Age:** No symbols, just numbers
**Screen 9 - Theme:** No symbols; Classic, Forest, Night, Rose shown as color swatches

### Layout Guidelines

1. **Progress bar:** Top of screen, only on question screens (not interstitials/paywall)
2. **Book logo:** Centered, larger on hero (~130px), smaller on question screens (~80px)
3. **Questions:** Serif font, centered
4. **Options:** Full width cards with left-aligned symbol + text
5. **CTA button:** Full width, positioned at bottom of screen
   - On burgundy background: Cream button (#F5F0E8) with burgundy text (#6a2e41)
   - On cream background: Burgundy button (#6a2e41) with cream text (#F5F0E8)
6. **Interstitials:** Screen 3 uses book open logo + verse + tagline; Screen 8 uses book open logo + verse (from Screen 7) + tagline. No progress bar on interstitials.
7. **Margins:** 16-24px side margins throughout

### Screen 1: Hero Welcome - Special Layout

**Two-Section Layout with Circular Divider:**
- **Top Section (Cream):** 40% of screen height
  - Cream background (#F5F0E8)
  - Animated book logo (comes from top with bounce)
  - Logo has subtle glow effect (burgundy #6a2e41 at 15% opacity)
  
- **Circular Divider:** 
  - SVG arc creating smooth transition between sections
  - Height: ~120px
  - Creates elegant curved separation
  
- **Bottom Section (Burgundy):** 60% of screen height
  - Dark burgundy background (#6a2e41)
  - App name: "Pocket Verse" (Lora, 37px, semi-bold, cream color)
  - Tagline: "The right verse for right now" (Nunito, 16px, regular, cream)
  - Award element (centered between tagline and button):
    - Decorative branch images on left and right
    - Text: "Helping more than" (regular) / "5,000+ users" (bold)
    - 16px font size
  - CTA button: "Get Started" (cream button, burgundy text, bottom of section)

**Animation:**
- Logo animates from top (-200px) with spring animation
- Subtle bounce effect (scales to 1.1 then back to 1)
- Fade in opacity (600ms)

---

## Flow Diagram

```
[1] Hero (onboarding.tsx)
    ↓
[2] Name (onboarding-name)
    ↓
[3] Interstitial 1: Psalm 139:1 + "God's Word has something for exactly where you are"
    ↓
[4] Age
    ↓
[5] Bible familiarity
    ↓
[6] Struggles
    ↓
[7] What brings you here ──→ determines verse (6 options)
    ↓
[8] Interstitial 2: verse + tagline from Screen 7
    ↓
[9] Theme + Verse Preview (combined): choose color, verse card, "Looks beautiful"
    ↓
[10] Paywall 1: 3 days premium offer
    ↓
[11] Paywall 2: reminder 1 day before trial ends
    ↓
[12] Paywall 3: how trial works, CTA "Try for free", Restore/Terms/Privacy
    ↓
    ├── [Pays] → Premium, onboarding complete → (tabs)
    └── [Dismisses X] → onboarding complete (on Screen 12) → (tabs)
```

---

## Implementation Notes

- **Route files:** `onboarding.tsx`, `onboarding-name`, `onboarding-interstitial-1`, `onboarding-age`, `onboarding-bible-familiarity`, `onboarding-struggles`, `onboarding-seeking`, `onboarding-interstitial-2`, `onboarding-theme-preview` (combined theme + verse), `onboarding-paywall-1`, `onboarding-paywall-2`, `onboarding-paywall-3`.
- **Alternate routes (not in main flow):** `onboarding-theme` and `onboarding-verse-preview` exist; current flow goes Interstitial 2 → theme-preview → paywall-1.
- **Entry:** App index checks `isOnboardingComplete()`; if false, replaces to `/onboarding`.
- **Data:** Stored via `src/services/onboarding.ts` (AsyncStorage keys for name, age, bible familiarity, struggles, seeking verseKey, theme). `setOnboardingComplete()` called when user completes or dismisses final paywall.
