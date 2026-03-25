# Seller Onboarding Portal — Product Spec

## Overview

This is a full-featured Seller Onboarding Portal that guides vendors through the complete registration and approval process required to sell on a marketplace. It simulates a real-world workflow: sellers submit their profile, documents, and inventory, while an approver reviews and acts on each submission.

---

## Features

### Authentication
- Email + OTP login flow (test OTP: `010494`)
- Multi-user session support with localStorage persistence
- Pre-configured demo accounts:
  - **Seller:** `seller@brand.com` — fully populated profile (Acme Corp)
  - **Approver:** `approver@tgt.com` — reviewer interface

---

### Seller Dashboard

Six onboarding task cards, each with:
- Progress percentage
- Color-coded status badges: `Yet to submit` | `In progress` | `Verification pending` | `Approved` | `Action needed`

| Task | Description |
|------|-------------|
| Profile Details | Business info and store policies |
| Documentation | Business licenses and tax forms |
| Item Setup | Product inventory import |
| Stripe Setup | Payment processing configuration |
| Integrations | Third-party integrations (optional) |
| Partner Services | Fulfillment and marketing partners (optional) |

---

### Profile Management

Six-tabbed form covering:

1. **Basic Information** — Business name, EIN, contact number, admin name, business type, website
2. **Addresses & Warehouses** — Business address with dynamic multi-warehouse management
3. **Branding** — Brands the seller carries
4. **Privacy Policy** — Store privacy policy text
5. **Return Policy** — Return window (days), restocking fee %, and description
6. **Business Details** — DUNS number and TIN

Supports real-time progress tracking, form validation, and view-only mode after approval.

---

### Documentation

- **Primary documents:** W9, Form 8822B, Address Proof — with file upload UI
- **Brand documentation:** Dynamic brand addition, classification (Reseller / Original Manufacturer), authorization document uploads
- Per-document approval tracking with resubmission support for rejected docs

---

### Item Setup

- CSV/Excel file upload for bulk inventory import
- Processing simulation with a results table showing: Title, Description, Barcode, Item Type
- Pagination for large catalogs

---

### Approver Interface

- Dedicated view for the approver role
- Browse all registered sellers and their submissions
- Review profile sections and documents in detail
- Approve or reject individual submissions via modal

---

### Onboarding / Lead Evaluation Form

Three-tab lead evaluation form completed before a seller reaches the dashboard:

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

### Journey Step Tracking

Sellers progress through four tracked stages:

`onboarding` → `vetting` → `bsa` → `complete`

- Stored in `seller_leads.journey_step`
- Smart login redirect: returning users are dropped back into their last stage automatically
  - `complete` → `/dashboard`
  - `vetting` or `bsa` → `/vetting`
  - Otherwise → `/onboarding`
- Timestamps recorded: `vetting_passed_at`, `agreement_accepted_at`

---

### Integrations

Available at `/dashboard/integrations` (optional task). Lists five integration options — all currently in "Coming Soon" state, enabled post-approval:

| Integration | Description |
|-------------|-------------|
| Shopify | Sync inventory and orders |
| WooCommerce | Order management |
| Amazon Seller Central | Import and sync listings |
| Google Merchant Center | Push to Google Shopping |
| QuickBooks | Sync invoices and financials |

---

### Partner Services

Available at `/dashboard/partners` (optional task). Six partners across two categories — all currently in "Coming Soon" state, enabled post-approval:

**Fulfillment**
- FedEx Fulfillment
- UPS Supply Chain
- ShipBob

**Marketing**
- Klaviyo — Email/SMS marketing
- Meta Ads — Facebook/Instagram ads
- Bazaarvoice — Reviews syndication

---

### Login / Landing Page

- Left column with marketing copy and feature cards (Vetted Network, Premium Insights)
- Unified auth card supporting both new registration and returning sign-in
- Toggle between "Create account" and "Sign In" modes
- Footer with Terms of Service, Privacy Policy, Contact links
- Navigation bar with Process, Support, FAQ links
