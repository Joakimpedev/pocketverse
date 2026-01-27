# Backend API Setup Instructions

## Why This Is Needed
The OpenAI API key must never be in your mobile app. It needs to be on a secure backend server that your app calls.

## Quick Setup (Vercel - Recommended)

### 1. Deploy Backend to Vercel

**Option A: Via Vercel CLI (if installed)**
```bash
npm install -g vercel
cd [project-root]
vercel
```
- Follow prompts to deploy
- Set environment variable: `OPENAI_API_KEY` = your API key
- Copy the deployment URL

**Option B: Via Vercel Dashboard**
1. Go to https://vercel.com
2. Import your Git repository
3. Set environment variable: `OPENAI_API_KEY` = your API key
4. Deploy

### 2. Update App with Backend URL

After deploying, update `src/services/openai.ts`:
```typescript
const API_BASE_URL = 'https://your-project.vercel.app/api/get-verse';
```

Or set environment variable:
```bash
EXPO_PUBLIC_API_URL=https://your-project.vercel.app/api/get-verse
```

### 3. Your API Key (For Backend Environment Variable)
```
YOUR_OPENAI_API_KEY_HERE
```

## Alternative: Firebase Cloud Functions

If you prefer Firebase Cloud Functions instead of Vercel, let me know and I can create that setup.

## Security
✅ API key is ONLY on the backend server (never in the app)
✅ App stores won't reject your build
✅ Users can't extract your API key
✅ You can monitor/rate-limit API usage on the backend










