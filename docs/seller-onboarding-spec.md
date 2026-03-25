# Seller Onboarding Portal — Product Spec

## Overview

This portal guides vendors through the registration and approval process required to sell on a marketplace. Sellers complete a lead evaluation form, pass vetting, and accept a Business Service Agreement before their application is submitted.

---

## Features

### Authentication
- Email + OTP login flow (test OTP: `010494`)
- Multi-user session support with Supabase Auth persistence
- Pre-configured demo account:
  - **Seller:** `seller@brand.com`

---

### Login / Landing Page

- Left column with marketing copy and feature cards (Vetted Network, Premium Insights)
- Unified auth card supporting both new registration and returning sign-in
- Toggle between "Create account" and "Sign In" modes
- Footer with Terms of Service, Privacy Policy, Contact links
- Navigation bar with Process, Support, FAQ links

---

### Onboarding / Lead Evaluation Form

Three-tab lead evaluation form completed after first login:

1. **01 Identity** — Legal business name, Tax ID, industry focus
2. **02 Leadership** — Lead executive name, designation, organizational structure (Sole Prop / Partnership / Corporation)
3. **03 Digital** — Website URL, social media imports (Instagram, LinkedIn, Twitter), real-time security rating assessment

Additional details:
- Draft save functionality with Supabase persistence
- Role-based step locking
- Side navigation with support chat widget
- Real-time security score animation

---

### Vetting & Business Service Agreement (BSA) Flow

Triggered after the lead evaluation form is submitted. Two sequential phases:

**Vetting Phase**
- Animated background verification progress (0–100% over 60 seconds)
- Verification checklist:
  - Business License Validation
  - Tax Compliance (W-9 / VAT)
  - International Sanction List Check (sub-checks: International Registry, Identity Authentication)
- Info cards explaining the vetting rationale and security/encryption details

**BSA Phase**
- Displays Business Service Agreement with 5 sections: Introduction, Scope of Services, Fees & Compensation, Data Privacy & Security, Term & Termination
- Checkbox acceptance required before proceeding
- "Accept & Continue" button (disabled until checkbox is checked)
- Download PDF option
- "Need Help?" support panel and Next Steps guidance card

---

### Completion Screen

Shown after BSA is accepted (`journey_step = 'complete'`). Confirms the application has been submitted and informs the seller that the team will review and follow up.

---

### Journey Step Tracking

Sellers progress through four tracked stages:

`onboarding` → `vetting` → `bsa` → `complete`

- Stored in `seller_leads.journey_step`
- Smart login redirect: returning users are dropped back into their last stage automatically
  - `complete` → `/complete`
  - `vetting` or `bsa` → `/vetting`
  - Otherwise → `/onboarding`
- Timestamps recorded: `vetting_passed_at`, `agreement_accepted_at`
