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
  journey_step: JourneyStep | null
  vetting_passed: boolean | null
  vetting_passed_at: string | null
  agreement_accepted: boolean | null
  agreement_accepted_at: string | null
}
