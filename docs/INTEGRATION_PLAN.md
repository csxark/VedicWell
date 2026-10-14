# Integration Plan — Dosha Assessment Application
## Railway FastAPI ML + Supabase Persistence + Guest-to-User Synchronization

> [!NOTE]
> **Document Status — Historical Baseline & Architecture Record**:
> This document records the original pre-integration baseline audit, architectural decision rationale, and implementation phases.
> All phases have been implemented and validated. For current production endpoint specifications, see [API_CONTRACT.md](API_CONTRACT.md) and [DEPLOYMENT_AND_TESTING.md](DEPLOYMENT_AND_TESTING.md).

---

## 1. Audit Summary (Pre-Integration Baseline)

### 1.1 Frontend Framework
- **Framework**: React 18 + TypeScript + Vite
- **Routing**: react-router-dom v6
- **State**: React Context (`AuthContext`), local component state
- **Styling**: TailwindCSS + shadcn/ui + Radix UI
- **Auth client**: `@supabase/supabase-js` v2
- **Build**: Vite with `VITE_` prefix env vars

### 1.2 Backend Artifact (Railway FastAPI)
- **Entry point**: `backend/main.py`
- **Model file**: `backend/dosha_model.pkl` (29 MB XGBoost model)
- **Procfile**: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Startup**: Lazy model loading on first `/predict` request
- **Existing endpoints**:
  - `GET /` — root info
  - `GET /health` — status + model_loaded flag
  - `POST /predict` — XGBoost inference with rule-based fallback
  - `OPTIONS /{path}` — global CORS preflight handler
- **CORS**: `allow_origins=["*"]`, `allow_credentials=False`
- **Endpoints Implemented in Integration**:
  - `GET /current-dosha` — fetches user's latest assessment via Supabase JWT (implemented)
  - `GET /recommendations` — returns Ayurvedic lifestyle, diet, herbs, and yoga (implemented)
  - `GET /db-status` — checks Supabase schema readiness (implemented)
  - `POST /run-migrations` — executes migrations on demand (implemented)

### 1.3 Supabase Schema (authoritative from migrations)

**Migration 1** (`20260206082125_971115c2.sql`):
- `public.profiles` — user profile with dominant_dosha, vata/pitta/kapha percentages
- `public.dosha_assessments` — assessment history with answers JSONB, vata/pitta/kapha scores
- `public.symptom_history` — AI chatbot consultation records
- `public.user_engagement` — activity tracking
- RLS policies: users can only access their own rows
- Trigger `on_auth_user_created` — auto-creates profile on signup
- Trigger `update_profiles_updated_at` — auto-updates timestamp

**Migration 2** (`20260915160000_add_ml_prediction_columns.sql`):
- Adds to `dosha_assessments`: `confidence`, `secondary_dosha`, `secondary_confidence`, `prediction_source`, `key_traits`

**TypeScript types** (`src/integrations/supabase/types.ts`):
- Fully typed Database interface reflecting both migrations

### 1.4 Frontend API Client (`src/lib/doshaApi.ts`)
- `predictDosha(answers, token?)` — calls `POST /predict`, falls back to local scoring
- `getCurrentDosha(token)` — calls `GET /current-dosha` (endpoint NOT in backend)
- `getRecommendations(token, fallback)` — calls `GET /recommendations` (endpoint NOT in backend)
- `checkHealth()` — calls `GET /health`
- `wakeBackend()` — polls `/health` up to 3x for Railway cold-start

### 1.5 Environment Variables
- Frontend (Vite): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_DOSHA_API_URL`
- Backend: `MODEL_PATH`, `PORT`
- `VITE_DOSHA_API_URL` is currently **empty** in `.env` — Railway endpoint not configured

### 1.6 Chatbot (Symptom Checker)
- Supabase Edge Function at `supabase/functions/symptom-checker/index.ts`
- Uses `LOVABLE_API_KEY` -> Lovable AI Gateway -> `google/gemini-3-flash-preview`
- Saves history to `symptom_history` if user is authenticated
- Frontend calls edge function with anon key for unauthenticated, user JWT for authenticated

### 1.7 Authentication Flow
- `AuthContext.tsx`: signUp, signIn, signOut, updateProfile, refreshProfile
- Standard Supabase email+password auth with email verification
- `AuthCallback.tsx`: handles email verification redirect to `/dashboard`
- **No anonymous auth** currently implemented
- **No guest-to-user reconciliation** currently implemented

---

## 2. Gap Analysis and Resolution Status (Historical Audit & Current State)

### 2.1 Critical Gaps & Resolution Matrix

| # | Original Issue | Severity | Status | Resolution Detail |
|---|----------------|----------|--------|-------------------|
| 1 | `VITE_DOSHA_API_URL` empty in example | Critical | **Resolved** | Documented in `.env.example` with fallback to local scoring |
| 2 | `/current-dosha` endpoint missing from FastAPI | High | **Resolved** | Implemented with Supabase JWT verification in `backend/main.py` |
| 3 | `/recommendations` endpoint missing from FastAPI | Medium | **Resolved** | Implemented with personalized Ayurvedic guidance in `backend/main.py` |
| 4 | Guest assessments NOT persisted | Critical | **Resolved** | Dual-strategy: `guestDoshaCache` + background Supabase persistence |
| 5 | No guest-to-user reconciliation | Critical | **Resolved** | Implemented in `AuthContext` via `claim_guest_assessment()` RPC + fallback |
| 6 | `Dashboard.tsx` missing `useEffect` import | High | **Resolved** | Fixed import, added effect cleanup to prevent race conditions |
| 7 | `dosha_assessments.user_id NOT NULL` | Architecture | **Resolved** | Migration 3 drops NOT NULL, adds `guest_session_id` and anon RLS |

### 2.2 Security Status

| # | Security Finding | Original Risk | Resolution |
|---|------------------|---------------|------------|
| 1 | SymptomChecker anon key Bearer | Medium | Authenticated user JWT forwarded when session is active |
| 2 | Guest assessments cross-access | High | Anon SELECT policy removed; rows claimed securely via `auth.uid()` in `claim_guest_assessment()` RPC |
| 3 | Database administration endpoints | High | `/db-status` and `/run-migrations` protected with `ADMIN_SECRET` header verification |

---

## 3. Architecture Decision: Guest Persistence Strategy

### Selected Strategy: localStorage Cache + DB Claim on Login

**Rationale**: The existing `dosha_assessments.user_id NOT NULL` constraint prevents inserting rows without a valid `auth.users` UUID. Rather than immediately weakening this constraint or requiring Anonymous Auth enablement in Supabase, we implement:

1. **localStorage-only for guests**: After prediction, cache the full result + answers in `localStorage`
2. **Claim on login**: When user signs in or registers, the frontend reads the cache and calls a Supabase DB function `claim_guest_assessment()` which securely associates the cached assessment with the authenticated user
3. **Migration for guest support**: New migration adds `guest_session_id` and makes `user_id` nullable, enabling actual DB persistence for guests who return later without signing in

### Guest Cache Format
```json
{
  "version": 1,
  "guestSessionId": "<uuid-v4>",
  "assessmentId": null,
  "primaryDosha": "Vata",
  "confidence": 0.73,
  "secondaryDosha": "Pitta",
  "secondaryConfidence": 0.18,
  "keyTraits": ["..."],
  "answers": { "bodyFrame": "Thin and Lean", ... },
  "timestamp": "2026-10-15T01:19:45Z",
  "synced": false,
  "pendingClaim": false
}
```

### Reconciliation Security Properties
- Guest must know both `assessmentId` AND `guestSessionId` (random UUID)
- DB function uses `auth.uid()` server-side — client cannot inject a different user_id
- One-time claim: `guest_session_id` cleared after successful claim
- Idempotent: repeated login attempts do not create duplicate records

---

## 4. Implementation Phases

### Phase 1: Fix Dashboard import bug
- Add `useEffect` to React import in `Dashboard.tsx`

### Phase 2: Add Missing Backend Endpoints
- `GET /current-dosha` — reads latest assessment from Supabase using JWT
- `GET /recommendations` — returns recommendation data based on user's dosha

### Phase 3: Guest Cache Library
- Create `src/lib/guestDoshaCache.ts`
- Integrate with `Assessment.tsx` completion handler for all users (guest + auth)

### Phase 4: Supabase Migration for Guest Support
- Make `user_id` nullable
- Add `guest_session_id`, `claimed_at`, `original_guest_session_id` columns
- Add RLS policies for guest access

### Phase 5: Guest Claim DB Function
- `claim_guest_assessment(p_guest_session_id, p_assessment_id)` SECURITY DEFINER function
- Frontend integration in AuthContext signIn/signUp

### Phase 6: Environment and Documentation
- Update `.env.example` files
- Update README with setup instructions

### Phase 7: Tests
- Tests for guest cache operations
- Tests for claim flow
- Tests for new backend endpoints

---

## 5. Schema Change Plan (Migration 3)

```sql
-- Phase A: Support guest assessments
ALTER TABLE public.dosha_assessments
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS guest_session_id TEXT,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS original_guest_session_id TEXT;

CREATE INDEX IF NOT EXISTS idx_dosha_assessments_guest_session
  ON public.dosha_assessments(guest_session_id)
  WHERE guest_session_id IS NOT NULL;

-- Phase B: RLS for guest inserts (anon role)
CREATE POLICY "Guests can insert their own assessments"
ON public.dosha_assessments FOR INSERT
TO anon
WITH CHECK (user_id IS NULL AND guest_session_id IS NOT NULL);

CREATE POLICY "Guests can view their own assessments by session"
ON public.dosha_assessments FOR SELECT
TO anon
USING (user_id IS NULL AND guest_session_id IS NOT NULL);

-- Phase C: Claim function
CREATE OR REPLACE FUNCTION public.claim_guest_assessment(
  p_guest_session_id TEXT,
  p_assessment_id UUID
) RETURNS JSONB AS $$ ... $$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. Unresolved External Dependencies

1. **Railway deployment URL**: `VITE_DOSHA_API_URL` must be set after Railway service deploy
2. **Supabase Anonymous Auth**: Optional enhancement if enabled in Supabase dashboard
3. **`LOVABLE_API_KEY`**: Must be set in Supabase project secrets for symptom checker
4. **Production CORS**: Backend should restrict `allow_origins` to frontend domain in production

---

*Generated by integration audit on 2026-10-15*
