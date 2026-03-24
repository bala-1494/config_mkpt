-- ============================================================
-- Fix: permission denied for table users
-- ============================================================
-- The authenticated role needs SELECT on auth.users to satisfy
-- the FK constraint (seller uuid REFERENCES auth.users(id))
-- when inserting/updating rows in seller_leads, seller_details,
-- seller_documents, and brand_docs.
-- ============================================================

GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;
