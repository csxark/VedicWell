-- Migration 003: Strict Validation, Abuse Prevention & Database Integrity
-- Enforces database-level CHECK constraints, enums, length limits, anti-injection filters,
-- and verifies Row Level Security (RLS) on all user-facing tables.

-- 1. Profiles Table Constraints
-- Enforce valid name lengths, rejection of HTML tags, valid dosha enums, and 0-100 percentages.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_full_name_length_check,
  DROP CONSTRAINT IF EXISTS profiles_full_name_no_html_check,
  DROP CONSTRAINT IF EXISTS profiles_dominant_dosha_check,
  DROP CONSTRAINT IF EXISTS profiles_vata_percentage_range_check,
  DROP CONSTRAINT IF EXISTS profiles_pitta_percentage_range_check,
  DROP CONSTRAINT IF EXISTS profiles_kapha_percentage_range_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_full_name_length_check
    CHECK (full_name IS NULL OR (length(trim(full_name)) >= 2 AND length(full_name) <= 60)),
  ADD CONSTRAINT profiles_full_name_no_html_check
    CHECK (full_name IS NULL OR full_name !~ '<[^>]+>'),
  ADD CONSTRAINT profiles_dominant_dosha_check
    CHECK (dominant_dosha IS NULL OR dominant_dosha IN ('vata', 'pitta', 'kapha')),
  ADD CONSTRAINT profiles_vata_percentage_range_check
    CHECK (vata_percentage >= 0 AND vata_percentage <= 100),
  ADD CONSTRAINT profiles_pitta_percentage_range_check
    CHECK (pitta_percentage >= 0 AND pitta_percentage <= 100),
  ADD CONSTRAINT profiles_kapha_percentage_range_check
    CHECK (kapha_percentage >= 0 AND kapha_percentage <= 100);

-- 2. Dosha Assessments Constraints
-- Enforce scores >= 0, confidence in [0, 1], valid status values, and dosha enums.
ALTER TABLE public.dosha_assessments
  DROP CONSTRAINT IF EXISTS dosha_assessments_status_check,
  DROP CONSTRAINT IF EXISTS dosha_assessments_dominant_dosha_check,
  DROP CONSTRAINT IF EXISTS dosha_assessments_secondary_dosha_check,
  DROP CONSTRAINT IF EXISTS dosha_assessments_confidence_range_check,
  DROP CONSTRAINT IF EXISTS dosha_assessments_secondary_confidence_range_check,
  DROP CONSTRAINT IF EXISTS dosha_assessments_scores_non_negative_check;

ALTER TABLE public.dosha_assessments
  ADD CONSTRAINT dosha_assessments_status_check
    CHECK (status IN ('completed', 'in_progress', 'draft')),
  ADD CONSTRAINT dosha_assessments_dominant_dosha_check
    CHECK (dominant_dosha IN ('vata', 'pitta', 'kapha', 'Vata', 'Pitta', 'Kapha')),
  ADD CONSTRAINT dosha_assessments_secondary_dosha_check
    CHECK (secondary_dosha IS NULL OR secondary_dosha IN ('vata', 'pitta', 'kapha', 'Vata', 'Pitta', 'Kapha')),
  ADD CONSTRAINT dosha_assessments_confidence_range_check
    CHECK (confidence IS NULL OR (confidence >= 0.0 AND confidence <= 1.0)),
  ADD CONSTRAINT dosha_assessments_secondary_confidence_range_check
    CHECK (secondary_confidence IS NULL OR (secondary_confidence >= 0.0 AND secondary_confidence <= 1.0)),
  ADD CONSTRAINT dosha_assessments_scores_non_negative_check
    CHECK (vata_score >= 0 AND pitta_score >= 0 AND kapha_score >= 0);

-- 3. Symptom History Constraints
-- Enforce non-empty symptom description, length 3-2000, no HTML tags, and valid dosha type.
ALTER TABLE public.symptom_history
  DROP CONSTRAINT IF EXISTS symptom_history_symptoms_length_check,
  DROP CONSTRAINT IF EXISTS symptom_history_symptoms_no_html_check,
  DROP CONSTRAINT IF EXISTS symptom_history_dosha_type_check;

ALTER TABLE public.symptom_history
  ADD CONSTRAINT symptom_history_symptoms_length_check
    CHECK (length(trim(symptoms)) >= 3 AND length(symptoms) <= 2000),
  ADD CONSTRAINT symptom_history_symptoms_no_html_check
    CHECK (symptoms !~ '<[^>]+>'),
  ADD CONSTRAINT symptom_history_dosha_type_check
    CHECK (dosha_type IS NULL OR dosha_type IN ('vata', 'pitta', 'kapha', 'tridosha', 'Unknown'));

-- 4. User Engagement Constraints
ALTER TABLE public.user_engagement
  DROP CONSTRAINT IF EXISTS user_engagement_type_non_empty_check,
  DROP CONSTRAINT IF EXISTS user_engagement_activity_type_non_empty_check;

ALTER TABLE public.user_engagement
  ADD CONSTRAINT user_engagement_activity_type_non_empty_check
    CHECK (length(trim(activity_type)) > 0);

-- 5. Row Level Security Verification
-- Ensure RLS is active on all tables and grant necessary permissions.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dosha_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;

-- Grant standard authenticated access
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dosha_assessments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.symptom_history TO authenticated;
GRANT SELECT, INSERT ON public.user_engagement TO authenticated;
