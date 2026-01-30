# RevenueCat Setup Verification Checklist

## ✅ Your Current Configuration

- **Bundle ID**: `com.pocketverse.app` ✅ (Added to app.json)
- **RevenueCat iOS API Key**: `appl_fpkyZlNfRkwPWrLPnkWMdqYPUvg` ✅ (Added to config)
- **RevenueCat Project ID**: `ofng55f1bcdffa` ✅

---

## 🔍 Verify These Settings Match Your Code

### 1. Entitlement Name ✅
**Your code expects**: `premium`

**Check in RevenueCat**:
- Go to your RevenueCat project → "Entitlements" tab
- You should have an entitlement with ID: **`premium`** (exactly this name, lowercase)
- If it's named differently (e.g., `Premium`, `PREMIUM`, `pro`), you'll need to either:
  - Rename it to `premium` in RevenueCat, OR
  - Update the code in `src/services/purchases.ts` line 97 to match your entitlement name

### 2. Package Identifiers ✅
**Your code expects**:
- Monthly package identifier must **contain** the word: `monthly` (case-insensitive)
  - Examples that work: `monthly`, `$rc_monthly`, `Monthly_Package`, `MONTHLY_SUB`
- Yearly package identifier must **contain** the word: `yearly` OR `annual` (case-insensitive)
  - Examples that work: `yearly`, `annual`, `$rc_annual`, `Yearly_Package`, `ANNUAL_SUB`

**Check in RevenueCat**:
- Go to your RevenueCat project → "Offerings" tab
- Click on your offering (probably named `default`)
- Check your packages:
  - Monthly package identifier should include "monthly" somewhere
  - Yearly package identifier should include "yearly" or "annual" somewhere
- If they don't match, either:
  - Rename the package identifiers in RevenueCat to include these words, OR
  - Update the code in `app/paywall.tsx` lines 26-32 to match your identifiers

### 3. Products Connected ✅
**Check in RevenueCat**:
- Go to "Products" tab
- Verify you have:
  - Monthly subscription product (Product ID: `com.pocketverse.app.monthly` or similar)
  - Yearly subscription product (Product ID: `com.pocketverse.app.yearly` or similar)
- Both products should be **attached to the `premium` entitlement**
  - Click on the `premium` entitlement → check "Products" section
  - Both monthly and yearly should be listed there

### 4. Offering Configuration ✅
**Check in RevenueCat**:
- Go to "Offerings" tab
- You should have an offering (usually named `default`)
- This offering should have both packages (monthly and yearly) added to it
- Make sure the offering is **published** (not in draft mode)

### 5. Product IDs in App Store Connect ✅
**Verify these match**:
- In RevenueCat, check your product IDs (e.g., `com.pocketverse.app.monthly`)
- In App Store Connect, verify you have In-App Purchase products with the **exact same Product IDs**
- The Product IDs must match exactly between:
  - App Store Connect
  - RevenueCat Products
  - (Not the Bundle ID, but the individual product IDs)

---

## 🧪 Quick Test Checklist

Once everything matches, test:

- [ ] App initializes without RevenueCat errors
- [ ] Paywall screen loads (should fetch offerings)
- [ ] Monthly button shows correct price
- [ ] Yearly button shows correct price
- [ ] Clicking monthly/yearly opens purchase dialog (in sandbox)
- [ ] After purchase, premium status is granted
- [ ] Restore purchases works
- [ ] Premium features unlock (usage limit bypassed, counter hidden)

---

## 📝 Quick Reference

### Current Code Expectations:
```typescript
// Entitlement name (in src/services/purchases.ts line 97):
customerInfo.entitlements.active['premium']  // Must be 'premium'

// Package identifiers (in app/paywall.tsx lines 26-32):
pkg.identifier.toLowerCase().includes('monthly')  // Must contain 'monthly'
pkg.identifier.toLowerCase().includes('yearly') || pkg.identifier.toLowerCase().includes('annual')  // Must contain 'yearly' or 'annual'
```

### Bundle ID:
```
com.pocketverse.app
```

If you need to change any of these expectations, let me know and I can update the code to match your RevenueCat configuration!












