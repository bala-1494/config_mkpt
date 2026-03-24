export type UserRole = 'seller' | 'approver'

export type TaskStatus = 'yet_to_submit' | 'in_progress' | 'verification_pending' | 'approved' | 'action_needed'

export type DocStatus = 'not_uploaded' | 'pending' | 'approved' | 'rejected'

export type DocType = 'w9' | 'form_8822b' | 'address_proof'

export type BrandClassification = 'reseller' | 'original_manufacturer'

export type JourneyStep = 'onboarding' | 'vetting' | 'bsa' | 'complete'

export interface User {
  id: string
  email: string
  role: UserRole
  name?: string
}

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface Warehouse {
  id: string
  name: string
  street: string
  city: string
  state: string
  zip: string
}

/** Captures data collected during lead evaluation, vetting, and agreement signup stages */
export interface SellerLead {
  id: string
  seller: string
  business_name: string
  ein: string
  /** formerly onboarding_industry */
  industry: string | null
  admin_name: string
  /** formerly onboarding_designation */
  designation: string | null
  business_type: string
  website: string
  journey_step: JourneyStep | null
  vetting_passed: boolean | null
  vetting_passed_at: string | null
  agreement_accepted: boolean | null
  agreement_accepted_at: string | null
}

/** Extended seller attributes filled in post-onboarding via the Dashboard profile flow */
export interface SellerDetails {
  id: string
  seller: string
  contact_number: string
  business_address: Address | null
  warehouses: Warehouse[]
  brands: string[]
  privacy_policy: string
  return_window_days: number | null
  restocking_fee_percent: number | null
  return_description: string
  duns_number: string
  tin: string
  profile_status: TaskStatus
  stripe_connected: boolean
  integrations: Record<string, boolean>
  partner_services: Record<string, boolean>
}

/**
 * Merged view combining identity fields from seller_leads with attribute fields
 * from seller_details. Used by Dashboard and ProfilePage.
 */
export interface SellerProfile {
  // identity (sourced from seller_leads)
  business_name: string
  ein: string
  admin_name: string
  business_type: string
  website: string
  // attributes (sourced from seller_details)
  contact_number: string
  business_address: Address | null
  warehouses: Warehouse[]
  brands: string[]
  privacy_policy: string
  return_window_days: number | null
  restocking_fee_percent: number | null
  return_description: string
  duns_number: string
  tin: string
  profile_status: TaskStatus
  stripe_connected: boolean
  integrations: Record<string, boolean>
  partner_services: Record<string, boolean>
}

export interface SellerDocument {
  id: string
  seller: string
  doc_type: DocType
  file: string
  status: DocStatus
  rejection_reason: string
}

export interface BrandDoc {
  id: string
  seller: string
  brand_name: string
  classification: BrandClassification | ''
  auth_file: string
  status: DocStatus
  rejection_reason: string
}

export interface OnboardingTask {
  key: string
  label: string
  description: string
  route: string
  progress: number
  status: TaskStatus
  optional?: boolean
}
