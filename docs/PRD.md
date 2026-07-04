# Empire 1 — Product Requirements Document

> **Status:** Draft · **Owner:** Monieq Mejia · **Last updated:** 2026-07-02  
> **Notion:** https://app.notion.com/p/39364261899b819eaf4cf3b55dae01ce

---

## 1. Executive Summary

Empire 1 is a multi-product AI platform serving four domains: **revenue systems**, **game studio**, **music production**, and **cultural digital art**. It deploys as a single Next.js app that routes across four public domains by HTTP host, backed by FastAPI + MongoDB on Google Cloud Run.

---

## 2. Problem Statement

Empire 1 had substantial backend infrastructure — 245+ AI engines, CRM, compliance layers, game studio, audio forge — but the public surface was misaligned with what's being sold:

- Landing page promoted "Revenue OS" but didn't capture leads or show ecosystem breadth
- Admin panels (Machines, Regulatory) showed hardcoded fake data
- Southern Lyfestyle had 5 broken gallery images and no CRM integration
- CRM lanes used generic labels not tied to actual products
- Analytics showed platform usage but no sales funnel or product conversion data
- `/foundry` route had a broken async import that crashed at runtime

---

## 3. Goals & Success Metrics

| Metric | Target |
|--------|--------|
| Revenue OS free demo completions/week | 10+ |
| Leads captured in CRM/week | 5+ |
| Southern build requests/month | 3+ |
| Revenue Receipt sales ($299)/month | 2+ |
| Revenue Sprint bookings ($999)/month | 1+ |
| Admin panel data accuracy | 100% live, 0% hardcoded |

---

## 4. User Personas

### The Operator (internal)
Manages the platform via `sla113.southernlifestyle.org`. Needs to see what's selling, manage leads, build games, produce music, run compliance, manage tenants.

### The Founder / Solo Operator
Solo founder, agency owner, indie builder who needs to get paid this week. Enters at `empire1.cloud` via free Revenue OS demo.  
**Path:** Free demo → $299 Receipt → $999 Sprint → $5K+ Implementation

### The Community Builder
Car club member, barbershop owner, family, community group — El Monte / SGV. Enters at `southernlifestyle.org`.  
**Path:** Request form → $250–$1,000 custom build

### The Game Builder
Developer or studio operator using SLA113 infrastructure. Operator-key gated.

### The Music Creator
Artist or producer using Sonance Pro and SL Universal on `lyrica3.com`.

---

## 5. Product Inventory

### Revenue OS — `empire1.cloud`
**Revenue model:** Free demo · $299 Receipt · $999 Sprint · $5K+ Implementation · $50K+ HIC Adoption  
**Live routes:** `/`, `/try-revenue-os`, `/revenue-receipt`, `/revenue-os`, `/dashboard`  
**Known gaps:** Dashboard Stripe billing uses mock `cus_test_123`. No email confirmation after lead capture.

### Southern Lyfestyle — `southernlifestyle.org`
**Revenue model:** $250 Personal · $500 Community · $750 Full World · $1,000 Premium + add-ons  
**Known gaps:** No real gallery photos. No payment path from form. No email confirmation.

### SLA113 Game Studio — `sla113.southernlifestyle.org`
Full AI game dev pipeline. Operator-key gated.  
**Known gaps:** Admin login is client-side only. SonanceProStemDeck untested end-to-end.

### Sonance Pro / Lyrica 3 — `lyrica3.com`
Separate deployment. Stem deck at `/admin/stem-deck` in SLA113 console.

---

## 6. Feature Requirements

### P0 — Fix before driving traffic

| # | Feature | Status |
|---|---------|--------|
| 1 | Real logo PNG at `/public/empire1-logo.png` | ⬜ Needs file |
| 2 | Real logo PNG at `/public/southern-logo.png` | ⬜ Needs file |
| 3 | Fix dashboard Stripe billing mock | ⬜ Open |
| 4 | Server-side admin key validation | ⬜ Open |
| 5 | Email confirmation after lead capture | ⬜ Open |

### P1 — Next sprint

| # | Feature | Notes |
|---|---------|-------|
| 6 | Real Southern gallery images | Replace CSS placeholders |
| 7 | Stripe deposit on Southern form | "Pay deposit to start" after concept draft |
| 8 | Revenue OS try-flow auto lead | Auto-save anonymous run to CRM |
| 9 | Dashboard billing — live session | Remove mock ID |
| 10 | CRM email follow-up trigger | Email draft on `qualified` stage |

### P2 — Planned

| # | Feature | Notes |
|---|---------|-------|
| 11 | Gatsby public frontend | Separate from Next.js admin/tool routes |
| 12 | Vision AI integration | Image analysis / camera input on public pages |
| 13 | Southern arcade demo | Playable demo on southernlifestyle.org |
| 14 | Automated Stripe checkout | Currently falls back to manual payment |
| 15 | Public portfolio page | Completed Southern builds as live gallery |

---

## 7. Revenue Model

| Product | Price | Monthly Target | Monthly Revenue |
|---------|-------|----------------|-----------------|
| Revenue Receipt | $299 | 4 sales | $1,196 |
| Revenue Sprint | $999 | 2 sales | $1,998 |
| Southern Build (avg $600) | $250–$1,000 | 3 builds | $1,800 |
| Implementation | $5,000+ | 1/quarter | $1,667 avg |
| **Total** | | | **~$6,660/mo** |

---

## 8. CRM Data Model

**Pipeline stages:** `lead` → `qualified` → `proposal` → `negotiation` → `onboarding` → `active` → `at_risk` → `churned`

**Product lanes:** `revenue_receipt` · `revenue_sprint` · `revenue_enterprise` · `southern_build` · `game_studio` · `sonance_music` · `free_demo`

**Lead sources:** `empire1_landing` · `southern_request` · `revenue_os_try` · `referral` · `linkedin` · `cold_outreach`

---

## 9. Technical Architecture

```
empire1-frontend (Next.js, Cloud Run)
├── Tenant router (middleware.ts — host-based)
│   ├── empire1.cloud                  → EmpireHome + Revenue OS
│   ├── southernlifestyle.org          → SouthernHome
│   ├── sla113.southernlifestyle.org   → SLA113 admin console
│   └── lyrica3.com                    → Redirect to /universal
│
├── API proxy (app/api/[...path]/route.ts)
│   ├── /api/foundry/* → SLA113 backend
│   └── /api/*         → Hybrid backend
│
empire1-backend (FastAPI, Cloud Run)
├── /sla113/*              — Game studio, audio, vision, compliance
├── /crm/*                 — Lead pipeline, activities, metrics
├── /business-analytics/*  — Revenue, usage, KPIs
├── /billing/*             — Stripe checkout, portal, webhooks
└── /revenue-os/*          — Revenue OS command engine

Database: MongoDB Atlas · CI/CD: Cloud Build · Alt deploy: Railway
```

---

## 10. What Was Built — PR #18

| File | Change |
|------|--------|
| `EmpireHome.tsx` | Full redesign — animated logo SVG, ticker, Revenue OS hero, ecosystem grid, lead capture, pricing, footer |
| `SouthernHome.tsx` | Full redesign — new logo SVG, warm amber palette, CSS gallery cards, CRM-wired request form |
| `CRMPanel.tsx` | Product-oriented lanes, "What's Selling" header bar, dark theme |
| `BusinessAnalyticsPanel.tsx` | Sales funnel tab, action-required panel, by-product breakdown |
| `MachinesPanel.tsx` | Live from `/api/sla113/game-types` + `/api/sla113/stats` |
| `RegulatoryPanel.tsx` | Live from `/api/sla113/compliance` with expandable reports |
| `SpriteCutter.jsx` | Real canvas-based sprite sheet slicer |
| `app/foundry/page.tsx` | Fixed broken async import |

---

## 11. Open Questions

1. **Gatsby frontend** — Does it replace EmpireHome entirely or coexist? Clean handoff boundary needed since admin console, Revenue OS, and SLA113 all live in Next.js.
2. **Vision AI** — What's the intended use case? Uploaded asset analysis? Camera-based input? AI-generated imagery for Southern builds?
3. **Southern portfolio** — Completed builds at their own URLs, or a `/work` portfolio page?
4. **Email infrastructure** — `email_service.py` exists in the backend but no transactional email provider is configured in env (SendGrid, Postmark, Resend needed for lead confirmation).
5. **Dashboard auth** — Is there a real user auth flow planned for `/dashboard`, or is it operator-only?
