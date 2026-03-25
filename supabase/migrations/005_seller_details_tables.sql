-- ============================================================
-- Seller Details — Per-section profile tables
-- ============================================================
-- Adds six granular tables (one per seller-details section)
-- plus a section-status tracker.  Each section can be
-- independently submitted for approval.
-- ============================================================

-- ── Add phone_number to seller_leads ────────────────────────
ALTER TABLE public.seller_leads
  ADD COLUMN IF NOT EXISTS phone_number text;

-- ── seller_section_status ────────────────────────────────────
-- Tracks the approval lifecycle for each of the 6 sections.
-- One row per (seller, section) pair.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seller_section_status (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section          text NOT NULL
    CHECK (section IN (
      'basic_info','addresses','branding',
      'privacy_policy','return_policy','business_details'
    )),
  status           text NOT NULL DEFAULT 'yet_to_be_added'
    CHECK (status IN (
      'yet_to_be_added','draft','submitted','approved','rejected'
    )),
  rejection_reason text,
  submitted_at     timestamptz,
  reviewed_at      timestamptz,
  reviewed_by      text,
  approval_id      text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (seller, section)
);

DROP TRIGGER IF EXISTS seller_section_status_updated_at ON public.seller_section_status;
CREATE TRIGGER seller_section_status_updated_at
  BEFORE UPDATE ON public.seller_section_status
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── seller_addresses ─────────────────────────────────────────
-- Business primary address + warehouses (jsonb array).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seller_addresses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller         uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  street_address text,
  city           text,
  state          char(2),
  zip_code       text,
  -- Array of { id, warehouse_identifier, street_address, city, state, zip_code, contact_person }
  warehouses     jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS seller_addresses_updated_at ON public.seller_addresses;
CREATE TRIGGER seller_addresses_updated_at
  BEFORE UPDATE ON public.seller_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── seller_branding ──────────────────────────────────────────
-- Logo/banner storage paths + visual identity statement.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seller_branding (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller                     uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_url                   text,
  banner_url                 text,
  visual_identity_statement  text,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS seller_branding_updated_at ON public.seller_branding;
CREATE TRIGGER seller_branding_updated_at
  BEFORE UPDATE ON public.seller_branding
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── seller_privacy_policy ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seller_privacy_policy (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller         uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_title   text,
  policy_content text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS seller_privacy_policy_updated_at ON public.seller_privacy_policy;
CREATE TRIGGER seller_privacy_policy_updated_at
  BEFORE UPDATE ON public.seller_privacy_policy
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── seller_return_policy ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seller_return_policy (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller           uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  return_window    text,
  restocking_fee   numeric(5,2) NOT NULL DEFAULT 0,
  additional_terms text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS seller_return_policy_updated_at ON public.seller_return_policy;
CREATE TRIGGER seller_return_policy_updated_at
  BEFORE UPDATE ON public.seller_return_policy
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── seller_business_details ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seller_business_details (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller      uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duns_number text,
  ein         text,
  tin         text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS seller_business_details_updated_at ON public.seller_business_details;
CREATE TRIGGER seller_business_details_updated_at
  BEFORE UPDATE ON public.seller_business_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Row Level Security — sellers access only their own rows
-- ============================================================
ALTER TABLE public.seller_section_status  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_addresses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_branding         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_privacy_policy   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_return_policy    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_business_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seller_section_status: own rows" ON public.seller_section_status
  FOR ALL USING (auth.uid() = seller) WITH CHECK (auth.uid() = seller);

CREATE POLICY "seller_addresses: own rows" ON public.seller_addresses
  FOR ALL USING (auth.uid() = seller) WITH CHECK (auth.uid() = seller);

CREATE POLICY "seller_branding: own rows" ON public.seller_branding
  FOR ALL USING (auth.uid() = seller) WITH CHECK (auth.uid() = seller);

CREATE POLICY "seller_privacy_policy: own rows" ON public.seller_privacy_policy
  FOR ALL USING (auth.uid() = seller) WITH CHECK (auth.uid() = seller);

CREATE POLICY "seller_return_policy: own rows" ON public.seller_return_policy
  FOR ALL USING (auth.uid() = seller) WITH CHECK (auth.uid() = seller);

CREATE POLICY "seller_business_details: own rows" ON public.seller_business_details
  FOR ALL USING (auth.uid() = seller) WITH CHECK (auth.uid() = seller);

-- ── Storage bucket for seller brand assets ───────────────────
-- Create a bucket named "seller-assets" in the Supabase dashboard
-- (Storage > New bucket, toggle Public off).
-- Add Storage RLS policies:
--   INSERT  auth.uid()::text = (storage.foldername(name))[1]
--   SELECT  auth.uid()::text = (storage.foldername(name))[1]
--   DELETE  auth.uid()::text = (storage.foldername(name))[1]
