# Build Setup Instructions

## API Key Setup for App Store Builds

### ✅ Status Check:
- EAS CLI installed: ✅ (v16.28.0)
- Logged in: ✅ (joakimpe-2)

### Steps to Set Up API Key for Builds:

**1. Initialize EAS Project (ONE TIME):**
```
eas init
```
- Select your account (joakimpe-2)
- This creates `eas.json` file

**2. Set the Environment Variable (ONE TIME):**
```
eas env:create --name EXPO_PUBLIC_OPENAI_API_KEY --value "YOUR_OPENAI_API_KEY_HERE" --scope project
```

**3. Build for App Store:**
```
eas build --profile production --platform ios --auto-submit
```
(Or `--platform android` for Android, or `--platform all` for both)

### Your API Key:
```
YOUR_OPENAI_API_KEY_HERE
```

### For Local Development:
✅ Already set up! The `.env` file works automatically.

### Note:
- Local builds/test: Works automatically with `.env` file
- App Store builds: Run steps 1 and 2 above (one-time setup), then step 3 when you want to build

