-- ============================================================
-- Seller Onboarding Portal — Initial Schema
-- ============================================================
-- Run this in your Supabase SQL Editor (Database > SQL Editor)
-- to create all required tables, constraints, and RLS policies.
-- ============================================================

-- ── seller_leads ─────────────────────────────────────────────
-- Tracks lead evaluation and the onboarding journey step.
-- One row per seller (unique on seller = auth.uid()).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seller_leads (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller                uuid NOT NULL,

  -- Onboarding form fields
  business_name         text,
  ein                   text,
  industry              text,
  admin_name            text,
  designation           text,
  business_type         text,
  website               text,

  -- Journey tracking
  journey_step          text NOT NULL DEFAULT 'onboarding',
    -- values: 'onboarding' | 'vetting' | 'bsa' | 'complete'

  -- Vetting result
  vetting_passed        boolean NOT NULL DEFAULT false,
  vetting_passed_at     timestamptz,

  -- Business Service Agreement
  agreement_accepted    boolean NOT NULL DEFAULT false,
  agreement_accepted_at timestamptz,

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT seller_leads_seller_key UNIQUE (seller)
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS seller_leads_updated_at ON public.seller_leads;
CREATE TRIGGER seller_leads_updated_at
  BEFORE UPDATE ON public.seller_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── seller_details ────────────────────────────────────────────
-- Extended seller profile (filled in on the Dashboard).
-- One row per seller.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seller_details (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller                    uuid NOT NULL,

  contact_number            text,
  business_address          jsonb,   -- { street, city, state, zip, country }
  warehouses                jsonb,   -- array of warehouse objects
  brands                    jsonb,   -- array of brand name strings

  privacy_policy            text,
  return_window_days        integer,
  restocking_fee_percent    numeric,
  return_description        text,

  duns_number               text,
  tin                       text,

  profile_status            text NOT NULL DEFAULT 'yet_to_submit',
    -- values: 'yet_to_submit' | 'in_progress' | 'verification_pending' | 'approved' | 'action_needed'

  stripe_connected          boolean NOT NULL DEFAULT false,
  integrations              jsonb,
  partner_services          jsonb,

  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT seller_details_seller_key UNIQUE (seller)
);

DROP TRIGGER IF EXISTS seller_details_updated_at ON public.seller_details;
CREATE TRIGGER seller_details_updated_at
  BEFORE UPDATE ON public.seller_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── seller_documents ─────────────────────────────────────────
-- Primary business documents (W9, Form 8822B, Address Proof).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seller_documents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller            uuid NOT NULL,
  doc_type          text NOT NULL,   -- 'w9' | 'form_8822b' | 'address_proof'
  file              text,            -- storage path
  status            text NOT NULL DEFAULT 'not_uploaded',
    -- values: 'not_uploaded' | 'pending' | 'approved' | 'rejected'
  rejection_reason  text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT seller_documents_seller_doc_type_key UNIQUE (seller, doc_type)
);

DROP TRIGGER IF EXISTS seller_documents_updated_at ON public.seller_documents;
CREATE TRIGGER seller_documents_updated_at
  BEFORE UPDATE ON public.seller_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── brand_docs ───────────────────────────────────────────────
-- Brand authorisation documents.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.brand_docs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller            uuid NOT NULL,
  brand_name        text NOT NULL,
  classification    text,   -- 'reseller' | 'original_manufacturer'
  auth_file         text,   -- storage path
  status            text NOT NULL DEFAULT 'not_uploaded',
    -- values: 'not_uploaded' | 'pending' | 'approved' | 'rejected'
  rejection_reason  text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS brand_docs_updated_at ON public.brand_docs;
CREATE TRIGGER brand_docs_updated_at
  BEFORE UPDATE ON public.brand_docs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
-- Each seller can only read/write their own rows.
-- ============================================================

ALTER TABLE public.seller_leads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_details   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_docs       ENABLE ROW LEVEL SECURITY;

-- seller_leads
CREATE POLICY "seller_leads: own rows" ON public.seller_leads
  FOR ALL USING (auth.uid() = seller) WITH CHECK (auth.uid() = seller);

-- seller_details
CREATE POLICY "seller_details: own rows" ON public.seller_details
  FOR ALL USING (auth.uid() = seller) WITH CHECK (auth.uid() = seller);

-- seller_documents
CREATE POLICY "seller_documents: own rows" ON public.seller_documents
  FOR ALL USING (auth.uid() = seller) WITH CHECK (auth.uid() = seller);

-- brand_docs
CREATE POLICY "brand_docs: own rows" ON public.brand_docs
  FOR ALL USING (auth.uid() = seller) WITH CHECK (auth.uid() = seller);

-- ── Storage bucket ────────────────────────────────────────────
-- Run this only if the bucket doesn't already exist.
-- (Supabase Storage > New bucket)
-- Name: documents
-- Public: false
-- ─────────────────────────────────────────────────────────────
-- Storage RLS policies are managed in the Supabase dashboard
-- under Storage > Policies.  Add:
--   INSERT  auth.uid()::text = (storage.foldername(name))[1]
--   SELECT  auth.uid()::text = (storage.foldername(name))[1]
--   DELETE  auth.uid()::text = (storage.foldername(name))[1]
