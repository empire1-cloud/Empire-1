# Empire Revenue OS

## What It Is

Empire Revenue OS is a complete revenue operating system built into Empire-1 / Hybrid Intelligence Core. It generates, sells, tracks, charges, delivers, and reports revenue workflows from a single command center.

Core promise: **Empire-1 turns any business, repo, creator brand, agency, landing page, or idea into a paid offer, buyer list, outreach campaign, payment path, delivery receipt, and revenue dashboard.**

## Why It Exists

Empire-1 already has Money Pipeline, Pipeline Composer, Omni Agent, billing, analytics, CRM, and GTM infrastructure — but no unified revenue layer that chains them into a sellable workflow. Empire Revenue OS fills that gap.

The goal is **sellable immediately** — a person can open Empire-1, enter a business, generate a revenue plan, create offers, get buyer profiles, copy outreach messages, track leads, collect payment (manually or via Stripe), and deliver a receipt.

## Product Modules

| # | Module | Function |
|---|--------|----------|
| 1 | **Empire Receipts Agent** | Revenue diagnosis, money leak audit, fastest paid offer, pricing ladder, landing copy, outreach kit |
| 2 | **Revenue Command Center** | Main cockpit — run full workflow, view all modules, track leads, monitor analytics |
| 3 | **Offer Forge** | Generate 3 paid offers: Quick Audit ($97), Core System ($299), Revenue Sprint ($999) |
| 4 | **Buyer Finder** | Generate 25 buyer profiles (personas/segments only — no real people) |
| 5 | **Outreach Desk** | Cold DMs, emails, follow-ups, objection replies, close messages, call confirmation |
| 6 | **Revenue CRM** | Create, list, update leads with pipeline stages (new → targeted → contacted → replied → call_booked → invoice_sent → paid → delivered → upsell → lost) |
| 7 | **Checkout Desk** | Stripe checkout or manual payment fallback |
| 8 | **Delivery Receipt Engine** | Customer-facing proof artifact with delivered assets, next 7 days, upsell recommendation |
| 9 | **Revenue Analytics Dashboard** | Total commands, receipts, leads, pipeline value, paid revenue, leads by status |
| 10 | **Omni Revenue Operator** | Task templates for follow-up, outreach, payment tracking, delivery, pipeline summaries |

## Frontend Routes

| Route | Page | Description |
|-------|------|-------------|
| `/revenue-os` | Main cockpit | Full Revenue OS with 9 tabbed sections |
| `/revenue-receipt` | Receipt Agent | Fast single-artifact generator |
| `/dashboard` | System Dashboard | Entry point with CTA cards to Revenue OS |

## Backend Endpoints

All endpoints are under `/api/revenue-os/`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/run` | Full Revenue OS workflow — generates receipt, offers, buyers, outreach, pipeline, checkout, delivery receipt, analytics, 72h plan |
| POST | `/receipt` | Generate or update a revenue receipt |
| POST | `/offer-forge` | Generate 3 paid offers |
| POST | `/buyer-finder` | Generate 25 buyer profiles |
| POST | `/outreach` | Generate outreach campaign |
| POST | `/leads` | Create a lead |
| GET | `/leads` | List leads (optional `?status=` and `?segment=` filters) |
| PATCH | `/leads/{lead_id}` | Update lead status/details |
| POST | `/checkout` | Create Stripe checkout or manual payment fallback |
| POST | `/delivery-receipt` | Generate customer-facing delivery receipt |
| GET | `/analytics` | Revenue OS analytics summary |
| GET | `/dashboard` | Full dashboard data object with recent commands/leads |

Legacy endpoint: `/api/revenue-receipts/` (unchanged, still works).

## Data Persistence

MVP persistence uses JSON files stored at `backend/app/data/revenue_os/`:

- `commands.json` — Command run history
- `receipts.json` — Generated receipts
- `leads.json` — CRM leads
- `delivery_receipts.json` — Delivery receipts

Helper functions in `backend/app/services/revenue_os_store.py`:

- `ensure_store()` — Create directories and files
- `load_json_store(name)` — Load records
- `save_json_store(name, records)` — Save records
- `append_record(store, record)` — Add record
- `get_record(store, id)` — Get by ID
- `update_record(store, id, updates)` — Update by ID
- `list_records(store, **filters)` — List with optional filters

Marked as MVP. Replace with database when ready.

## Engine Integration

### Money Pipeline
- Called from `_try_money_pipeline()` in `revenue_os.py`
- Uses `MoneyPipelineEngine.generate_pipeline()` from `services/money_pipeline_engine.py`
- If engine fails or import is unavailable, returns `None` and falls back to deterministic template
- Engine output is included in `/run` response as `engine_output` field

### Pipeline Composer
- Referenced for future template integration
- Not hard-wired into current MVP — templates can be added as pipeline composition grows

### Execution Logger
- Revenue OS command runs are logged via `execution_logger.log()`
- Engine path, status, input/output data captured
- Logger failure is caught silently — does not block the revenue workflow

### Billing / Stripe
- Existing billing router at `backend/app/routers/billing.py`
- Revenue OS `/checkout` endpoint uses Stripe if `STRIPE_SECRET_KEY` is configured
- If unconfigured, returns manual payment fallback with clear instructions
- Does not block the revenue workflow

### Analytics
- Revenue OS analytics counts total commands, receipts, leads, pipeline value, paid revenue
- Leads segmented by pipeline stage
- Uses JSON store data source
- Analytics endpoint at `GET /api/revenue-os/analytics`

### CRM/GTM
- Legacy CRM/GTM routers remain untouched
- Revenue OS has its own lightweight lead management (create/list/update)
- Pipeline stages match standard sales stages

### Omni Agent
- Task template file at `omni_agent/state/revenue_tasks.json`
- Task types: `follow_up_new_leads`, `generate_daily_outreach`, `mark_paid_leads`, `generate_delivery_receipts`, `summarize_revenue_pipeline`, `identify_stale_pipeline`
- Integration with Omni Agent runtime pending — template only for now

## Manual Test Payload

```json
POST /api/revenue-os/run

{
  "business_name": "Test Founder Studio",
  "business_type": "agency",
  "current_offer": "AI website and automation setup",
  "target_customer": "local service businesses",
  "current_price": "$500",
  "revenue_goal": "$5,000 by Monday",
  "links_or_notes": "Needs a fast paid offer, buyer list, outreach plan, payment path, and delivery receipt.",
  "urgency_level": "high",
  "desired_output_type": "command",
  "preferred_sales_channel": "mixed",
  "founder_context": "Solo founder with existing AI tools and ability to deliver manually.",
  "assets_available": "Landing page, GitHub repo, AI automation skills, Stripe/manual payment option.",
  "constraints": "Must be sellable immediately without waiting for perfect SaaS deployment."
}
```

Expected response fields:

- `receipt_id` — present
- `command_id` — present
- `receipt` — revenue diagnosis, money leak, fastest offer, pricing ladder, landing copy, DM/email scripts, 72h plan
- `forged_offers` — 3 offers (Quick Audit $97, Core System $299, Revenue Sprint $999)
- `buyer_profiles` — 25 profiles
- `outreach_campaign` — DMs, emails, follow-ups, objections, closes
- `revenue_pipeline` — stages with counts
- `checkout_recommendation` — Stripe or manual fallback
- `delivery_receipt_template` — customer-facing proof
- `analytics` — platform totals
- `seventy_two_hour_action_plan` — Day 1/2/3
- `risks` — assumptions and warnings
- `next_actions` — clear next steps

## How to Sell by Monday

1. Open `/revenue-os`
2. Enter a real business (yours or a prospect's)
3. Click "Run Revenue OS"
4. Review the receipt, 3 offers, buyer profiles, and outreach campaign
5. Copy the cold DM/email scripts
6. Send first 5 DMs
7. Track leads in the Pipeline tab
8. When someone says yes, collect payment manually and mark lead as paid
9. Generate a delivery receipt as proof
10. Use the analytics tab to show pipeline progress

Price points for prospects:
- Quick Audit: $97 — low risk, fast clarity
- Core System: $299 — complete revenue system
- Revenue Sprint: $999 — done-with-you execution

## MVP Limitations

- **Persistence**: JSON files — will not survive server restart on ephemeral storage. Replace with DB (MongoDB or Postgres).
- **Payment**: Stripe checkout or manual only. No automated invoicing or subscription billing yet.
- **Buyer Profiles**: Generated personas, not real leads. Outreach must still be done manually.
- **No Email Sending**: Outreach scripts are copy-paste only. No automated email delivery.
- **No Calendar**: Call booking is manual.
- **Engine Integration**: Money Pipeline integration is best-effort. Falls back to deterministic templates if unavailable.
- **No Authentication on Revenue OS Endpoints**: Add auth middleware before production use.
- **Omni Agent**: Template only — not wired into Omni runtime.

## Next Hardening Steps

1. Add auth/team scoping to Revenue OS endpoints
2. Replace JSON file persistence with database
3. Wire Omni Revenue Operator tasks into Omni Agent runtime
4. Add email sending via Resend/SendGrid
5. Generate real lead lists via buyer finder + data enrichment
6. Add booking calendar integration
7. Add automated invoice generation
8. Add Stripe webhook handling for automatic lead status updates
9. Add revenue forecasting to analytics
10. Add white-label option for agencies

## Public Try Flow

The Revenue OS has a public try route at `/try-revenue-os` — no login required.

**Flow:** Homepage → Try Empire Revenue OS → Use Demo Payload or enter business → Generate → View result cards → Copy outreach → See checkout/manual payment → Save lead

See `docs/PUBLIC_TRY_FLOW.md` for full documentation.
