-- ============================================================
-- Drop dashboard-only tables
-- ============================================================
-- seller_details, seller_documents, and brand_docs were only
-- used by the dashboard flow which has been removed.
-- seller_leads is kept as it tracks the onboarding journey.
-- ============================================================

DROP TABLE IF EXISTS public.brand_docs CASCADE;
DROP TABLE IF EXISTS public.seller_documents CASCADE;
DROP TABLE IF EXISTS public.seller_details CASCADE;
