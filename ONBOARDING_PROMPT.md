# Onboarding Build Prompt

## Reference Files
- **Design spec:** `pocketverse/ONBOARDING_SPEC.md`
- **Logo:** `assets/book_logo/rose.png` (transparent PNG)
- **Award branches:** `assets/book_logo/left-awards-branch-gray.png`, `assets/book_logo/right-award-banner-branch-gray-77x138.png`

---

## Phase 1: Hero Screen (COMPLETED)

**Reference Implementation:** `app/onboarding.tsx`

### Screen 1: Hero Welcome - Established Design

**Two-Section Layout with Circular Divider:**

**Top Section (40% of screen):**
- Cream background (#F5F0E8)
- Animated book logo (130px) with subtle glow
- Logo animation: comes from top with spring bounce effect

**Circular Divider:**
- SVG arc creating smooth curved transition
- Height: ~120px
- Burgundy fill (#6a2e41)

**Bottom Section (60% of screen):**
- Dark burgundy background (#6a2e41)
- App name: "Pocket Verse" (Lora, 37px, semi-bold, cream #F5F0E8)
- Tagline: "The right verse for right now" (Nunito, 16px, regular, cream)
- Award element (centered between tagline and button):
  - Left branch: `left-awards-branch-gray.png`
  - Right branch: `right-award-banner-branch-gray-77x138.png`
  - Text: "Helping more than" (regular) / "5,000+ users" (bold, 16px)
  - Branches tinted cream to match color scheme
- CTA button: "Get Started" (cream #F5F0E8 background, burgundy #6a2e41 text)

**Key Design Elements:**
- Colors: Cream (#F5F0E8) and Dark Burgundy (#6a2e41)
- Typography: Lora (serif) for headings, Nunito (sans-serif) for body
- Animation: Logo animates from top with spring physics
- Layout: Two-section split with elegant circular divider
- Spacing: 24px side margins, proper vertical spacing

**Behavior:**
- "Get Started" button navigates to Screen 2 (Name input)

---

## Phase 2: Name Screen (COMPLETED)

**Style Reference:** Match Screen 1 design system

**Reference Implementation:** `app/onboarding-name.tsx`

### Screen 2: Name Input

**Layout:**
1. Progress bar at top (~10% filled, dark burgundy on tan track)
2. Book logo (smaller than hero, ~80px, centered)
3. Question: "What's your name?" - Lora serif, semi-bold, ~24px, centered
4. Text input field - white background, subtle border, rounded corners
5. CTA button: "Continue" - dark burgundy background, cream text, always enabled (name is optional)

**Design specs (matching Screen 1):**
- Progress bar: 8px height (thicker), full width, dark burgundy fill (#6a2e41), tan track (#E5DDD3), 4px border radius
- Logo: ~80px, centered, NO glow effect (static logo only)
- Logo spacing: 40px top margin, 48px bottom margin
- Question font: Lora, semi-bold, ~24px, dark charcoal (#2D2D2D), centered
- Question spacing: 40px marginBottom (bigger gap between text and textbox)
- Input field: White (#FFFFFF), 1px border (#E0D8CF), 12px radius, 16px padding, placeholder text "Your name", 20px paddingTop on container
- Button: Dark burgundy (#6a2e41) background, cream (#F5F0E8) text, full width with 24px side margins, 16px vertical padding, 12px border radius
- Button behavior: Always enabled - name input is optional, user can skip
- Keyboard: Auto-focus on screen load (use useEffect with ref and autoFocus prop)
- Background: Cream (#F5F0E8) - full screen (no two-section layout for question screens)

**Visual reference:**
```
┌─────────────────────────────────┐
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░ │ (thicker progress bar)
│                                 │
│          [Book Logo]            │ (no glow, 40px top, 48px bottom)
│                                 │
│      What's your name?          │ (40px marginBottom)
│                                 │
│  ┌───────────────────────────┐  │ (white background, 20px paddingTop)
│  │ Your name                 │  │
│  └───────────────────────────┘  │
│                                 │
│                                 │
│        [ Continue ]             │ (burgundy bg, cream text, always enabled)
│                                 │
└─────────────────────────────────┘
```

---

## Phase 3: Interstitial Screen (COMPLETED)

**Style Reference:** Match Screen 1 design system

**Reference Implementation:** `app/onboarding-interstitial-1.tsx`

### Screen 3: Verse Interstitial

**Layout:**
1. Book logo (book_open.png) at top - 80px, 60% opacity
2. Stylized verse quote in italic
3. Psalm attribution in burgundy
4. Elegant divider line
5. Tagline text
6. CTA button: "Continue" - dark burgundy background, cream text

**Design specs:**
- Logo: book_open.png, 80px size, 60% opacity, centered, 32px marginBottom
- Verse: Lora italic, 24px, dark charcoal (#2D2D2D), centered, includes quotes in text
- Attribution: Lora regular, 18px, dark burgundy (#6a2e41), centered, 32px marginBottom
- Divider: 80% width, 1px height, burgundy (#6a2e41), 60% opacity, 32px marginVertical
- Tagline: Nunito regular, 20px, dark charcoal (#2D2D2D), centered
- Button: Dark burgundy (#6a2e41) background, cream (#F5F0E8) text, full width with 24px side margins, 16px vertical padding, 12px border radius
- Background: Cream (#F5F0E8) - full screen

**Animations (sequential):**
1. **Phase 1 (simultaneous, 600ms)**: Logo, verse, and attribution fade in together
2. **Phase 2 (500ms)**: Divider expands from 0 width to full width (80% of available space)
3. **Phase 3 (500ms)**: Tagline fades in

**Visual reference:**
```
┌─────────────────────────────────┐
│                                 │
│        [Book Logo]              │ (80px, 60% opacity, fades in)
│                                 │
│   "You have searched me, Lord,  │ (italic, fades in)
│      and you know me."          │
│                                 │
│        — Psalm 139:1            │ (burgundy, fades in)
│                                 │
│  ────────────────────────────   │ (expands from 0 to 80% width)
│                                 │
│  God's Word has something for  │ (fades in)
│  exactly where you are.         │
│                                 │
│        [ Continue ]              │ (burgundy bg, cream text)
│                                 │
└─────────────────────────────────┘
```

---

## Design System Reference

**Established Colors:**
- Cream: #F5F0E8
- Dark Burgundy: #6a2e41
- Dark Charcoal (text on cream): #2D2D2D

**Typography:**
- Serif headings: Lora (semi-bold)
- Sans-serif body: Nunito (regular/semi-bold)

**Key Patterns:**
- Two-section layout with circular divider (Screen 1 only)
- Question screens: Full cream background
- Buttons on question screens: Dark burgundy (#6a2e41) background with cream (#F5F0E8) text - always enabled
- Logo: Animated on Screen 1, static on other screens (NO glow effect on question screens)
- Progress bar: 8px height (thicker) for question screens
- Consistent spacing: 24px side margins, proper vertical spacing
- Logo spacing: 40px top, 48px bottom margins
- Text-to-input spacing: 40px marginBottom on question + 20px paddingTop on input container

## Notes for AI Coder

- **Reference Screen 1 implementation** (`app/onboarding.tsx`) for hero screen styling
- **Reference Screen 2 implementation** (`app/onboarding-name.tsx`) for question screen styling
- **Reference Screen 3 implementation** (`app/onboarding-interstitial-1.tsx`) for interstitial screen styling
- Use the established color palette (#F5F0E8, #6a2e41)
- Match typography (Lora for headings, Nunito for body)
- Question screens use full cream background (no two-section layout)
- Question screen buttons: Dark burgundy background with cream text, always enabled
- Question screen logos: Static, no glow effect
- Progress bar on question screens: 8px height (thicker)
- Auto-focus keyboard on question screens with text inputs
- Interstitial screens: Use book_open.png logo, sequential animations for elegant reveal
- Keep animations subtle and elegant
- Maintain consistent spacing and button styles throughout
