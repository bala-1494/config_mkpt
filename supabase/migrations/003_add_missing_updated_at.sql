-- ============================================================
-- Fix: record "new" has no field "updated_at"
-- ============================================================
-- If any of these tables existed before migration 001 ran,
-- CREATE TABLE IF NOT EXISTS silently skipped the column
-- definitions, leaving the set_updated_at trigger broken.
-- ADD COLUMN IF NOT EXISTS is idempotent — safe to re-run.
-- ============================================================

ALTER TABLE public.seller_leads     ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.seller_details   ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.seller_documents ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.brand_docs       ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
