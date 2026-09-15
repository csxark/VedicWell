-- Extend dosha_assessments with ML prediction columns
-- These columns store the XGBoost model's output alongside the existing
-- simple count-based scores, enabling both assessment types to coexist.

ALTER TABLE public.dosha_assessments
  ADD COLUMN IF NOT EXISTS confidence DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS secondary_dosha TEXT,
  ADD COLUMN IF NOT EXISTS secondary_confidence DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS prediction_source TEXT DEFAULT 'simple',
  ADD COLUMN IF NOT EXISTS key_traits JSONB;
