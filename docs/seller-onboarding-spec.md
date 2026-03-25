# Seller Onboarding Portal — Product Spec

## Overview

A seller onboarding portal that guides vendors through a linear registration and approval flow: account creation → lead evaluation → background vetting → business service agreement → completion. Built with React + MUI frontend and Supabase backend.

---

## Application Routes

| Route | Screen | Access |
|-------|--------|--------|
| `/login` | Landing / Auth | Public |
| `/onboarding` | Lead Evaluation Form | Authenticated |
| `/vetting` | Vetting + BSA | Authenticated |
| `/complete` | Completion Screen | Authenticated |

Unauthenticated users are redirected to `/login`. All unknown routes fall back to `/complete`.

---

## Screens

### 1. Login / Landing Page (`/login`)

**Layout:** Two-column — marketing copy on the left, auth card on the right.

**Navbar:**
- Brand name: "Marketplace portal" (red)
- Nav links: Process, Support, FAQ
- "Sign In" button (top right)

**Left column:**
- "JOIN THE NETWORK" badge
- Hero headline: *"Curating the next generation of market excellence."*
- Subtext about the onboarding process
- Two feature cards: **Vetted Network** (VerifiedUser icon) and **Premium Insights** (TrendingUp icon)

**Auth card (right column):**

Two modes — Register and Sign In — toggled via an inline link.

*Register mode:*
1. Full Name field
2. Email field
3. "Get OTP" button → reveals OTP input
4. OTP field (6-digit, hardcoded demo OTP: `010494`)
5. "Create Account →" submit button
6. On success → redirects to `/onboarding`

*Sign In mode:*
1. Email field
2. "Get OTP" button → reveals OTP input
3. OTP field
4. "Sign In →" submit button
5. On success → smart redirect based on `journey_step`:
   - `complete` → `/complete`
   - `vetting` or `bsa` → `/vetting`
   - Otherwise → `/onboarding`

**Footer:** Copyright · Terms of Service · Privacy Policy · Contact · Security icon

---

### 2. Lead Evaluation Form (`/onboarding`)

**Layout:** Left sidebar (248px) + scrollable main content + sticky footer bar.

**Sidebar:**
- Brand header: "Marketplace portal / Onboarding"
- Step nav (3 items, locked until reached):
  - Basic Information (active)
  - Vetting Progress (locked)
  - Business Service Agreement (locked)
- Support chat widget pinned at bottom ("We're online")

**Top header bar:** Help icon · Notifications icon (badge: 2) · User avatar

**Tab bar (sticky):** 01 IDENTITY · 02 LEADERSHIP · 03 DIGITAL — clicking scrolls to the corresponding section card.

**Section cards:**

*01 — Business Identity*
- Legal Business Name (required)
- Tax Identification Number (required)
- Primary Category Focus — dropdown with 10 industry categories

*02 — Leadership & Governance*
- Lead Executive Name (required)
- Designation (required, e.g. CEO, Managing Director)
- Organizational Structure — toggle: Sole Prop / Partnership / Corporation

*03 — Digital Presence*
- Corporate Website URL (with `https://` prefix adornment)
- Social Audit panel — Import buttons for Instagram, LinkedIn, Twitter; turns to a green confirmed state once clicked
- Security Rating panel — animates to score 85/100 ("Good") when a URL is entered; SSL & domain authority assessment

**Sticky footer:**
- Inline validation warning showing count of missing required fields and which section they're in
- "Save Draft" button — saves current form state to `seller_leads` with `journey_step: 'onboarding'`
- "Proceed to Vetting" button — validates required fields, saves with `journey_step: 'vetting'`, navigates to `/vetting`

Draft data is loaded from Supabase on mount so returning users see their saved progress.

---

### 3. Vetting & BSA (`/vetting`)

**Layout:** Left sidebar (248px) + scrollable main panel + top header bar.

**Sidebar:** Same brand header and support widget as onboarding. Step nav updates to reflect current phase:
- Basic Information — green checkmark (complete)
- Vetting Progress — active (vetting phase) or complete (bsa phase)
- Business Service Agreement — active (bsa phase) or locked (vetting phase)

**Top header bar:** Help icon · Notifications icon · User avatar

On mount, the page checks the seller's current state in Supabase:
- If `agreement_accepted = true` → skip to `/complete`
- If `vetting_passed = true` → skip straight to BSA phase

---

**Phase A — Vetting**

Label: STEP 2 OF 3

*Background Verification card:*
- Animated progress bar 0 → 100% over 60 seconds
- Live percentage counter ("IN PROGRESS" / "COMPLETE")
- "Currently cross-referencing global databases"
- Two sub-info cards:
  - **International Registry** — cross-border compliance across 140 jurisdictions
  - **Identity Auth** — real-time biometric and document authenticity protocols

*Verification Checklist card:*
- 3 items that tick off as progress reaches 33% / 67% / 100%:
  1. Business License Validation
  2. Tax Compliance (W-9 / VAT)
  3. International Sanction List Check
- Each item shows PROCESSING (blue) → APPROVED (green)

*Right sidebar cards:*
- **Why we vet** — explains vetting rationale; timeline note (24–48 hours); Support Center button
- **Secure & Encrypted** — dark gradient card with AES-256 encryption callout

When progress hits 100%, saves `vetting_passed: true`, `vetting_passed_at`, `journey_step: 'bsa'` to Supabase and transitions to Phase B.

---

**Phase B — Business Service Agreement**

Congratulations header with TaskAlt icon.

*BSA Document panel (left):*
- Document header with version tag (V2024.01.12)
- Scrollable agreement body — 5 sections:
  1. Introduction
  2. Scope of Services (with 3 bullet points)
  3. Fees & Compensation
  4. Data Privacy & Security (GDPR / CCPA / AES-256)
  5. Term & Termination
- Accept row at the bottom:
  - Checkbox: "I have read and agree to the Business Service Agreement terms"
  - "Accept & Continue" button — disabled until checkbox is checked

On accept: saves `agreement_accepted: true`, `agreement_accepted_at`, `journey_step: 'complete'` to Supabase, then navigates to `/complete`.

*Right column panels:*
- **Next Steps** — brief note about what happens post-acceptance
- **Need Help?** — 24/7 compliance team support with "Chat with Support" button
- **Download Agreement (PDF)** — clickable card; shows a snackbar ("PDF download will be available once the agreement is signed")

---

### 4. Completion Screen (`/complete`)

Centered card on a light grey background.

- Large green CheckCircle icon
- Heading: "You're all set!"
- Body: "Your application has been submitted successfully. Our team will review your details and get back to you shortly."
- "Sign out" button — signs the user out and redirects to `/login`

---

## Journey Step Tracking

Stored in `seller_leads.journey_step`. Four stages:

```
onboarding → vetting → bsa → complete
```

| Step | Set when | Redirects to |
|------|----------|--------------|
| `onboarding` | Account created | `/onboarding` |
| `vetting` | Lead form submitted | `/vetting` |
| `bsa` | Vetting passes (100%) | `/vetting` (BSA phase) |
| `complete` | BSA accepted | `/complete` |

Timestamps also saved: `vetting_passed_at`, `agreement_accepted_at`.

Returning users are automatically routed to the correct screen on sign-in.

---

## Authentication

- Supabase Auth with email + password (password = hardcoded OTP `010494`)
- OTP is hardcoded for demo purposes — no email is sent
- New accounts: sign-up flow with `seller_leads` row created on first login
- Session persisted via Supabase's built-in session management

---

## Database

Single table used by the live flow:

**`seller_leads`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `seller` | uuid | Foreign key → `auth.users` |
| `business_name` | text | Legal business name |
| `ein` | text | Tax ID |
| `industry` | text | Primary category focus |
| `admin_name` | text | Lead executive name |
| `designation` | text | Executive title |
| `business_type` | text | Org structure (sole_prop / partnership / corporation) |
| `website` | text | Corporate website URL |
| `journey_step` | text | Current stage in the flow |
| `vetting_passed` | boolean | Whether vetting completed |
| `vetting_passed_at` | timestamptz | Timestamp of vetting completion |
| `agreement_accepted` | boolean | Whether BSA was accepted |
| `agreement_accepted_at` | timestamptz | Timestamp of BSA acceptance |
| `created_at` | timestamptz | Row creation time |
| `updated_at` | timestamptz | Last update time (auto-managed by trigger) |

Row-level security: sellers can only read/write their own row.
