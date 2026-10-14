# Deployment, Testing, and Operations Guide
## Railway FastAPI ML Service + Supabase Persistence + Guest-to-User Synchronization

---

## 1. System Architecture Overview

```
                               ┌────────────────────────────────┐
                               │   Railway Cloud (FastAPI ML)   │
                               │                                │
                               │   • POST /predict (XGBoost)    │
                               │   • GET  /health (Cold-start)  │
                               │   • GET  /current-dosha        │
                               │   • GET  /recommendations      │
                               └──────────────┬─────────────────┘
                                              ▲
                                              │ HTTPS (REST / JWT)
                                              ▼
┌─────────────────────────────────┐   Direct SDK    ┌───────────────────────────────────┐
│     Client Browser (React 18)   │ ─────────────── │         Supabase Cloud            │
│                                 │                 │                                   │
│  • Guest localStorage cache     │                 │  • public.profiles                │
│  • Token auth header injection  │                 │  • public.dosha_assessments       │
│  • Automatic claim on login     │                 │  • claim_guest_assessment() RPC   │
│  • Cold-start retry logic       │                 │  • symptom-checker Edge Function  │
└─────────────────────────────────┘                 └───────────────────────────────────┘
```

---

## 2. Railway Deployment Instructions

### 2.1 Railway Project Setup
1. Log in to [Railway](https://railway.app).
2. Create a **New Project** and select **Deploy from GitHub repo**.
3. Select this repository: `csxark/pbl_project`.
4. In Railway project settings, set:
   - **Root Directory**: `backend`
   - **Build Command**: Leave default (Railway detects `requirements.txt`)
   - **Start Command**: Managed by `backend/Procfile` (`web: uvicorn main:app --host 0.0.0.0 --port $PORT`)

### 2.2 Backend Environment Variables
Configure the following in the Railway dashboard under **Variables**:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | Auto | Assigned automatically by Railway | `8000` |
| `MODEL_PATH` | No | Path relative to backend root | `dosha_model.pkl` |
| `ALLOWED_ORIGINS` | Recommended | Comma-separated allowed frontend origins | `https://your-frontend.vercel.app,http://localhost:8080` |
| `SUPABASE_URL` | Yes | Required for `/current-dosha` & `/recommendations` | `https://xyzcompany.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service key to fetch assessments server-to-server | `eyJh...` |

### 2.3 Railway Health Check
Under **Settings** → **Healthcheck**:
- **Healthcheck Path**: `/health`
- **Healthcheck Timeout**: `100` seconds (allows lazy XGBoost model loading on cold boot)

### 2.4 Railway Public URL
Under **Settings** → **Networking**:
- Click **Generate Domain**.
- Copy the generated domain (e.g., `https://dosha-ml-production.up.railway.app`).
- Set this URL as `VITE_DOSHA_API_URL` in your frontend environment.

---

## 3. Supabase Database Configuration

### 3.1 Applying Migrations
Apply the migrations in order:

1. **Migration 1**: `supabase/migrations/20260206082125_971115c2.sql`
   - Sets up initial tables (`profiles`, `dosha_assessments`, `symptom_history`, `user_engagement`) and basic RLS.
2. **Migration 2**: `supabase/migrations/20260915160000_add_ml_prediction_columns.sql`
   - Adds ML prediction columns: `confidence`, `secondary_dosha`, `secondary_confidence`, `key_traits`, `prediction_source`.
3. **Migration 3**: `supabase/migrations/20261015000000_guest_assessment_support.sql`
   - Relaxes `user_id` to nullable.
   - Adds `guest_session_id`, `claimed_at`, and `original_guest_session_id`.
   - Creates anon RLS policies for guest assessments.
   - Installs the secure `claim_guest_assessment()` `SECURITY DEFINER` function.

### 3.2 Executing via Supabase CLI or SQL Editor
```bash
# If using Supabase CLI
supabase db push

# Or execute SQL directly in Supabase Dashboard SQL Editor:
# Copy contents of supabase/migrations/20261015000000_guest_assessment_support.sql
```

### 3.3 Supabase Edge Functions Secrets
For the AI Symptom Checker:
```bash
supabase secrets set LOVABLE_API_KEY="your-api-key"
```

---

## 4. Frontend Configuration and Build

### 4.1 Frontend Environment Variables (`.env`)
Create or verify `.env` in the project root:

```env
# Supabase project URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase publishable anon key
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...

# Railway FastAPI deployed public endpoint
VITE_DOSHA_API_URL=https://dosha-ml-production.up.railway.app
```

### 4.2 Building for Production
```bash
# Typecheck
npx tsc --noEmit

# Production bundle
npm run build

# Preview build locally
npm run preview
```

---

## 5. Verification Matrix and Test Suites

### 5.1 Automated Frontend Tests (Vitest)
Run all frontend unit tests (30 tests covering heuristic scoring, schema, and guest cache):
```bash
npm test
```

### 5.2 Automated Backend Tests (Pytest)
Run all backend FastAPI unit and integration tests (11 tests):
```bash
cd backend
pytest test_main.py -v
```

### 5.3 Manual End-to-End Verification Checklist

| Scenario | Steps to Execute | Expected Behavior |
|----------|------------------|-------------------|
| **Cold Start Wakeup** | Load `/assessment` in browser | `wakeBackend()` calls `/health` with retries. Spinner displays gracefully. |
| **Authenticated Assessment** | Log in, complete all 11 questions | XGBoost endpoint returns prediction; saved directly to Supabase; dashboard immediately reflects new dominant dosha. |
| **Guest Assessment** | Open Incognito window, take assessment without logging in | Full result card displays with primary/secondary dosha and percentages; localStorage caches result with random `guestSessionId`. |
| **Guest-to-User Claim (Sign Up)** | From guest results page, click "Sign Up to Unlock", create account | Friendly banner shows "Assessment Ready to Sync"; on registration/email confirmation, assessment is claimed to account; dashboard loads claimed dosha. |
| **Guest-to-User Claim (Sign In)** | Take guest assessment, sign into existing account | Existing account claims the new assessment; profile is refreshed without data loss. |
| **Backend Fallback Mode** | Stop Railway or provide bad URL | Frontend detects timeout/failure, scores locally using rule-based algorithm, notifies user, and saves result without crashing. |
