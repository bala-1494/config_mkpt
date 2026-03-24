-- ============================================================
-- Fix: record "new" has no field "updated_at"
-- ============================================================
-- seller_leads was created before updated_at was added to the
-- schema definition.  The set_updated_at() trigger fires on
-- every UPDATE and references NEW.updated_at, which causes a
-- runtime error when the column does not exist.
--
-- This migration idempotently adds updated_at (and created_at)
-- to seller_leads if they are missing, then ensures the trigger
-- is in place.
-- ============================================================

ALTER TABLE public.seller_leads
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS seller_leads_updated_at ON public.seller_leads;
CREATE TRIGGER seller_leads_updated_at
  BEFORE UPDATE ON public.seller_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
