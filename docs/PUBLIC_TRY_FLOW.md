# Public Try Flow — Empire Revenue OS

## Public Route
`/try-revenue-os`

## Homepage CTA
The homepage hero at `/` now leads with:

**Headline:** "Turn your business into a revenue system by Monday."

**Primary CTA:** "Try Empire Revenue OS" → `/try-revenue-os`
**Secondary CTA:** "Generate Revenue Receipt" → `/revenue-receipt`

**Proof line:** "Public demo available. No admin access required."

## Demo Payload
The "Use Demo Payload" button fills the form with a realistic agency scenario:

- **Business:** Demo Founder Studio (AI agency)
- **Offer:** AI website and automation setup — $500
- **Target:** Local service businesses
- **Goal:** $5,000 by Monday
- **Channel:** Mixed (DM, email, local)

## API Endpoint
`POST /api/revenue-os/run` — no auth required for the run endpoint.

API helper: `lib/publicRevenueOsApi.ts`

### API Functions
| Function | Endpoint | Description |
|---|---|---|
| `runPublicRevenueOS(payload)` | `POST /api/revenue-os/run` | Generate full Revenue OS output |
| `createPublicLead(payload)` | `POST /api/revenue-os/leads` | Save lead/contact info |
| `createPublicCheckout(payload)` | `POST /api/revenue-os/checkout` | Create checkout or manual payment |

## Expected Result Cards
After generation, the page renders these sections:

1. **Revenue Diagnosis** — business name, offer, target, price, goal, money leak
2. **Fastest Paid Offer** — the top recommended offer
3. **3 Priced Offers** — with name, price, promise, target buyer, turnaround
4. **Top 5 Buyer Profiles** — persona type, segment, priority score, pain point
5. **3 Cold DMs** — copy-to-clipboard enabled
6. **1 Cold Email** — copy-to-clipboard enabled
7. **72-Hour Action Plan** — day-by-day tasks with copy button
8. **Risks & Warnings** — non-scary risk display
9. **Checkout / Manual Payment** — buy buttons or manual fallback
10. **Delivery Receipt Preview** — receipt summary with copy button

Each result shows `receipt_id` and `command_id`.

## Copy Behavior
- Each DM, email, and the action plan have individual copy buttons
- Delivery receipt preview has a "Copy Receipt" button
- Fallback to `document.execCommand('copy')` if clipboard API fails
- Shows "Copied!" confirmation on success

## Manual Checkout Behavior
If Stripe is not configured:
- Shows "Stripe is not configured yet" message
- Instructs: "For MVP, use invoice, Cash App, PayPal, or Stripe Payment Link"
- Shows "After payment, mark lead as paid and generate delivery receipt"
- Does not block the user

## Lead Capture Behavior
After result preview:
- **Headline:** "Want the full Revenue OS output?"
- **Fields:** name, email, business name, notes
- **Button:** "Save My Result"
- If save fails: "Lead save failed, but your result is still generated."
- After success: green confirmation banner

## Checkout Buttons
- **"Buy Full Revenue Receipt — $299"**
- **"Book Revenue Sprint — $999"**
- If `checkout_url` returned: opens Stripe checkout in new tab
- If manual fallback: shows instruction box

## Fallback Demo Mode
If the backend API call fails, the page renders deterministic sample content:
- Warning: "Backend unavailable. Showing demo fallback."
- All 9 result sections populated with realistic sample data
- User never sees a blank page

## Protected Routes (Not Changed)
| Route | Protection |
|---|---|
| `/admin/*` | SLA113 tenant only + token required |
| `/foundry` | SLA113 tenant only + token required |
| `/dashboard` | Empire1 tenant only |
| `/operator` | Empire1 tenant only |
| `/sla113` | No auth (visible in dev) |

## Public Routes (No Auth)
| Route | Purpose |
|---|---|
| `/` | Homepage with product hero |
| `/try-revenue-os` | Public try flow (NEW) |
| `/revenue-os` | Full Revenue OS command center |
| `/revenue-receipt` | Quick receipt generator |

## 90-Second Demo Script

1. Open `http://localhost:3000` (0:00)
2. See product hero: "Turn your business into a revenue system by Monday" (0:05)
3. Click "Try Empire Revenue OS" (0:10)
4. Click "Use Demo Payload" to fill the form (0:15)
5. Click "Generate My Revenue System" (0:20)
6. Wait for generation (0:20-0:35)
7. Scroll through result cards: diagnosis, offers, buyers (0:35-0:50)
8. Copy a cold DM (0:50-0:55)
9. Show checkout buttons: receipt ($299) or sprint ($999) (0:55-1:10)
10. Scroll to lead capture: "Want the full Revenue OS output?" (1:10-1:20)
11. Fill name + email, click "Save My Result" (1:20-1:30)
