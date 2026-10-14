-- Migration 3: Guest Assessment Support
-- Enables storing assessments for visitors who have not registered.
-- Preserves all existing authenticated-user data and RLS policies.
--
-- Strategy:
--   1. Make user_id nullable (existing rows keep their user_id).
--   2. Add guest_session_id for scoping guest records securely.
--   3. Add claimed_at and original_guest_session_id for audit trail.
--   4. Add anon-role INSERT/SELECT policies for guest rows.
--   5. Add claim_guest_assessment() DB function for secure login-time reconciliation.

-- ─── Step 1: Relax user_id constraint ────────────────────────────────────────
ALTER TABLE public.dosha_assessments
  ALTER COLUMN user_id DROP NOT NULL;

-- ─── Step 2: Guest tracking columns ──────────────────────────────────────────
ALTER TABLE public.dosha_assessments
  ADD COLUMN IF NOT EXISTS guest_session_id TEXT,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS original_guest_session_id TEXT;

-- Index to speed up guest session lookups
CREATE INDEX IF NOT EXISTS idx_dosha_assessments_guest_session
  ON public.dosha_assessments(guest_session_id)
  WHERE guest_session_id IS NOT NULL;

-- ─── Step 3: Constraint — every row must have either user_id or guest_session_id
ALTER TABLE public.dosha_assessments
  ADD CONSTRAINT dosha_assessments_owner_check
    CHECK (
      user_id IS NOT NULL
      OR guest_session_id IS NOT NULL
    );

-- ─── Step 4: RLS policies for anon role (guests) ─────────────────────────────

-- Allow anon to insert a guest assessment (no user_id, must have guest_session_id)
CREATE POLICY "anon_guests_can_insert_assessment"
ON public.dosha_assessments
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
  AND guest_session_id IS NOT NULL
  AND claimed_at IS NULL
);



-- ─── Step 5: claim_guest_assessment() — secure server-side claim function ─────
-- Called by the frontend after a guest signs in or registers.
-- Uses SECURITY DEFINER so it runs with elevated rights to update rows
-- that the authenticated user could not otherwise update (row was owned by anon).
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

  -- Find the matching unclaimed guest row
  SELECT * INTO v_row
  FROM public.dosha_assessments
  WHERE id              = p_assessment_id
    AND guest_session_id = p_guest_session_id
    AND user_id          IS NULL
    AND claimed_at       IS NULL
  FOR UPDATE SKIP LOCKED;   -- prevent concurrent claim attempts

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_found_or_already_claimed');
  END IF;

  -- Associate the row with the authenticated user
  UPDATE public.dosha_assessments
  SET
    user_id                  = v_uid,
    claimed_at               = now(),
    original_guest_session_id = p_guest_session_id,
    guest_session_id         = NULL          -- one-time claim: clear the session id
  WHERE id = v_row.id;

  -- Update or create the user's profile with the claimed dosha
  INSERT INTO public.profiles (user_id, dominant_dosha)
  VALUES (v_uid, v_row.dominant_dosha)
  ON CONFLICT (user_id) DO UPDATE
    SET dominant_dosha = EXCLUDED.dominant_dosha,
        updated_at     = now()
  WHERE profiles.dominant_dosha IS NULL;     -- only update if profile has no dosha yet

  RETURN jsonb_build_object(
    'success',       true,
    'assessment_id', v_row.id,
    'dominant_dosha', v_row.dominant_dosha
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.claim_guest_assessment(TEXT, UUID)
  TO authenticated;

-- ─── Step 6: Allow authenticated users to update rows they own ───────────────
-- (needed so the client can retry profile sync after a claim)
CREATE POLICY "Authenticated users can update their own assessments"
ON public.dosha_assessments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
