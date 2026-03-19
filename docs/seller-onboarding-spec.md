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
