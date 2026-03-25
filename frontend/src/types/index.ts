export type UserRole = 'seller' | 'approver'

export type JourneyStep = 'onboarding' | 'vetting' | 'bsa' | 'complete'

export interface User {
  id: string
  email: string
  role: UserRole
  name?: string
}

/** Captures data collected during lead evaluation, vetting, and agreement signup stages */
export interface SellerLead {
  id: string
  seller: string
  business_name: string
  ein: string
  industry: string | null
  admin_name: string
  designation: string | null
  business_type: string
  website: string
  phone_number: string | null
  journey_step: JourneyStep | null
  vetting_passed: boolean | null
  vetting_passed_at: string | null
  agreement_accepted: boolean | null
  agreement_accepted_at: string | null
}

// ── Seller Details — Section Approval Types ──────────────────

export type SectionStatus =
  | 'yet_to_be_added'
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'

export type SectionKey =
  | 'basic_info'
  | 'addresses'
  | 'branding'
  | 'privacy_policy'
  | 'return_policy'
  | 'business_details'

export interface SectionStatusRow {
  section: SectionKey
  status: SectionStatus
  rejection_reason?: string | null
  submitted_at?: string | null
  reviewed_at?: string | null
  reviewed_by?: string | null
  approval_id?: string | null
}

export interface WarehouseEntry {
  id: string
  warehouse_identifier: string
  street_address: string
  city: string
  state: string
  zip_code: string
  contact_person: string
}
