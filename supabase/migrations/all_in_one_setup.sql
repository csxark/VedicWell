-- ==============================================================================
-- ALL-IN-ONE IDEMPOTENT SUPABASE SETUP & MIGRATION SCRIPT
-- ==============================================================================
-- Safe to execute repeatedly on new or existing Supabase databases.
-- Combines:
--   1. Core schema (profiles, dosha_assessments, symptom_history, user_engagement)
--   2. ML prediction columns (confidence, secondary_dosha, key_traits, etc.)
--   3. Guest assessment support (nullable user_id, guest_session_id, RLS)
--   4. claim_guest_assessment() SECURITY DEFINER function
-- ==============================================================================

-- ─── 1. Core Tables ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  dominant_dosha TEXT CHECK (dominant_dosha IN ('vata', 'pitta', 'kapha')),
  vata_percentage INTEGER DEFAULT 0,
  pitta_percentage INTEGER DEFAULT 0,
  kapha_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dosha_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dominant_dosha TEXT NOT NULL CHECK (dominant_dosha IN ('vata', 'pitta', 'kapha')),
  vata_score INTEGER NOT NULL DEFAULT 0,
  pitta_score INTEGER NOT NULL DEFAULT 0,
  kapha_score INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.symptom_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms TEXT NOT NULL,
  dosha_type TEXT,
  additional_context TEXT,
  ai_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_engagement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ─── 2. ML Prediction Columns (Migration 2) ──────────────────────────────────

ALTER TABLE public.dosha_assessments
  ADD COLUMN IF NOT EXISTS confidence DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS secondary_dosha TEXT,
  ADD COLUMN IF NOT EXISTS secondary_confidence DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS prediction_source TEXT DEFAULT 'simple',
  ADD COLUMN IF NOT EXISTS key_traits JSONB;

-- ─── 3. Guest Assessment Support (Migration 3) ───────────────────────────────

-- Ensure user_id can be null for unauthenticated guests
ALTER TABLE public.dosha_assessments
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.dosha_assessments
  ADD COLUMN IF NOT EXISTS guest_session_id TEXT,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS original_guest_session_id TEXT;

-- Index for fast guest lookup
CREATE INDEX IF NOT EXISTS idx_dosha_assessments_guest_session
  ON public.dosha_assessments(guest_session_id)
  WHERE guest_session_id IS NOT NULL;

-- Ensure row belongs to either user_id or guest_session_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dosha_assessments_owner_check'
  ) THEN
    ALTER TABLE public.dosha_assessments
      ADD CONSTRAINT dosha_assessments_owner_check
      CHECK (user_id IS NOT NULL OR guest_session_id IS NOT NULL);
  END IF;
END $$;

-- ─── 4. Row Level Security (RLS) ─────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dosha_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Dosha Assessments Authenticated Policies
DROP POLICY IF EXISTS "Users can view their own assessments" ON public.dosha_assessments;
CREATE POLICY "Users can view their own assessments" ON public.dosha_assessments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own assessments" ON public.dosha_assessments;
CREATE POLICY "Users can create their own assessments" ON public.dosha_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can update their own assessments" ON public.dosha_assessments;
CREATE POLICY "Authenticated users can update their own assessments" ON public.dosha_assessments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Dosha Assessments Guest (anon) Policies
DROP POLICY IF EXISTS "anon_guests_can_insert_assessment" ON public.dosha_assessments;
CREATE POLICY "anon_guests_can_insert_assessment" ON public.dosha_assessments FOR INSERT TO anon WITH CHECK (user_id IS NULL AND guest_session_id IS NOT NULL AND claimed_at IS NULL);

DROP POLICY IF EXISTS "anon_guests_can_select_own_assessment" ON public.dosha_assessments;

-- Symptom History Policies
DROP POLICY IF EXISTS "Users can view their own symptom history" ON public.symptom_history;
CREATE POLICY "Users can view their own symptom history" ON public.symptom_history FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own symptom records" ON public.symptom_history;
CREATE POLICY "Users can create their own symptom records" ON public.symptom_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Engagement Policies
DROP POLICY IF EXISTS "Users can view their own engagement" ON public.user_engagement;
CREATE POLICY "Users can view their own engagement" ON public.user_engagement FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own engagement records" ON public.user_engagement;
CREATE POLICY "Users can create their own engagement records" ON public.user_engagement FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── 5. Database Functions and Triggers ───────────────────────────────────────

-- Profile timestamp updater
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- New user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Claim Guest Assessment Function (Atomic & Concurrency Protected)
CREATE OR REPLACE FUNCTION public.claim_guest_assessment(
  p_guest_session_id TEXT,
  p_assessment_id    UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row  public.dosha_assessments%ROWTYPE;
  v_uid  UUID := auth.uid();
BEGIN
  -- Caller must be authenticated
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_authenticated');
  END IF;

  -- Find the matching unclaimed guest row (with row-lock to prevent race conditions)
  SELECT * INTO v_row
  FROM public.dosha_assessments
  WHERE id               = p_assessment_id
    AND guest_session_id = p_guest_session_id
    AND user_id          IS NULL
    AND claimed_at       IS NULL
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_found_or_already_claimed');
  END IF;

  -- Associate row with authenticated user
  UPDATE public.dosha_assessments
  SET
    user_id                   = v_uid,
    claimed_at                = now(),
    original_guest_session_id = p_guest_session_id,
    guest_session_id          = NULL
  WHERE id = v_row.id;

  -- Update or insert user's profile with dominant dosha
  INSERT INTO public.profiles (user_id, dominant_dosha)
  VALUES (v_uid, v_row.dominant_dosha)
  ON CONFLICT (user_id) DO UPDATE
    SET dominant_dosha = EXCLUDED.dominant_dosha,
        updated_at     = now()
  WHERE profiles.dominant_dosha IS NULL;

  RETURN jsonb_build_object(
    'success',        true,
    'assessment_id',  v_row.id,
    'dominant_dosha', v_row.dominant_dosha
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_guest_assessment(TEXT, UUID) TO authenticated;
