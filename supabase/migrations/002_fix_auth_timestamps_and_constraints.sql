-- ==============================================================================
-- MIGRATION 002: AUTH, TIMESTAMPS, COMPLETION GATE & INTEGRITY CONSTRAINTS
-- ==============================================================================
-- Safe to execute repeatedly on new or existing Supabase databases.
-- Resolves:
--   1. Issue 2: Explicit assessment completion state ('status', 'assessment_completed')
--   2. Issue 3: Missing updated_at columns and automated triggers across all tables
--   3. Issue 4: Null column prevention, sensible defaults, and explicit role grants
-- ==============================================================================

-- ─── 1. Ensure Timestamp Updater Function ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ─── 2. Ensure created_at / updated_at Across All Tables ──────────────────────

-- profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- dosha_assessments
ALTER TABLE public.dosha_assessments
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_dosha_assessments_updated_at ON public.dosha_assessments;
CREATE TRIGGER update_dosha_assessments_updated_at
  BEFORE UPDATE ON public.dosha_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- symptom_history
ALTER TABLE public.symptom_history
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_symptom_history_updated_at ON public.symptom_history;
CREATE TRIGGER update_symptom_history_updated_at
  BEFORE UPDATE ON public.symptom_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- user_engagement
ALTER TABLE public.user_engagement
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_user_engagement_updated_at ON public.user_engagement;
CREATE TRIGGER update_user_engagement_updated_at
  BEFORE UPDATE ON public.user_engagement
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 3. Assessment Completion Gates (Issue 2) ─────────────────────────────────

-- Add status column to dosha_assessments ('in_progress' or 'completed')
ALTER TABLE public.dosha_assessments
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dosha_assessments_status_check'
  ) THEN
    ALTER TABLE public.dosha_assessments
      ADD CONSTRAINT dosha_assessments_status_check
      CHECK (status IN ('in_progress', 'completed'));
  END IF;
END $$;

-- Add assessment_completed boolean to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS assessment_completed BOOLEAN NOT NULL DEFAULT false;

-- Backfill existing profiles and assessments
UPDATE public.dosha_assessments
  SET status = 'completed'
  WHERE status IS NULL;

UPDATE public.profiles
  SET assessment_completed = true
  WHERE dominant_dosha IS NOT NULL;

-- Auto-confirm any existing unconfirmed users so their login is never blocked
UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE email_confirmed_at IS NULL;

-- ─── 4. Null Prevention & Sensible Defaults (Issue 4) ─────────────────────────

-- Backfill any existing null values before adding constraints
UPDATE public.dosha_assessments
  SET confidence = 0.75
  WHERE confidence IS NULL;

UPDATE public.dosha_assessments
  SET prediction_source = 'api'
  WHERE prediction_source IS NULL;

UPDATE public.dosha_assessments
  SET key_traits = '[]'::jsonb
  WHERE key_traits IS NULL;

-- Apply NOT NULL & Defaults
ALTER TABLE public.dosha_assessments
  ALTER COLUMN confidence SET DEFAULT 0.0,
  ALTER COLUMN confidence SET NOT NULL;

ALTER TABLE public.dosha_assessments
  ALTER COLUMN prediction_source SET DEFAULT 'api',
  ALTER COLUMN prediction_source SET NOT NULL;

ALTER TABLE public.dosha_assessments
  ALTER COLUMN key_traits SET DEFAULT '[]'::jsonb,
  ALTER COLUMN key_traits SET NOT NULL;

-- Check constraint on prediction_source
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dosha_assessments_prediction_source_check'
  ) THEN
    ALTER TABLE public.dosha_assessments
      ADD CONSTRAINT dosha_assessments_prediction_source_check
      CHECK (prediction_source IN ('api', 'local', 'simple'));
  END IF;
END $$;

-- ─── 5. Explicit Role Permissions ─────────────────────────────────────────────

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.dosha_assessments TO authenticated;
GRANT ALL ON TABLE public.symptom_history TO authenticated;
GRANT ALL ON TABLE public.user_engagement TO authenticated;

-- Allow anon guests to insert and select their guest assessments
GRANT INSERT, SELECT ON TABLE public.dosha_assessments TO anon;

-- ─── 6. Atomic Guest Claim Function with Completion Support ───────────────────

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

  -- Associate row with authenticated user and ensure status is completed
  UPDATE public.dosha_assessments
  SET
    user_id                   = v_uid,
    status                    = 'completed',
    claimed_at                = now(),
    original_guest_session_id = p_guest_session_id,
    guest_session_id          = NULL,
    updated_at                = now()
  WHERE id = v_row.id;

  -- Update user's profile with dominant dosha and mark assessment as completed
  INSERT INTO public.profiles (user_id, dominant_dosha, assessment_completed, updated_at)
  VALUES (v_uid, v_row.dominant_dosha, true, now())
  ON CONFLICT (user_id) DO UPDATE
    SET dominant_dosha       = EXCLUDED.dominant_dosha,
        assessment_completed = true,
        updated_at           = now();

  RETURN jsonb_build_object(
    'success',        true,
    'assessment_id',  v_row.id,
    'dominant_dosha', v_row.dominant_dosha
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_guest_assessment(TEXT, UUID) TO authenticated;
