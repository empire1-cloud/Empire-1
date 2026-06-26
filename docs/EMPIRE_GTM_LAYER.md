# Empire GTM Layer

Go-to-market intelligence engine for Revenue OS. Scores buyers against ICP, detects market signals, generates campaigns and sequences — all deterministic and local-first (no external APIs for MVP).

## Architecture

```
backend/app/
├── data/gtm/                       ← JSON file persistence (mirrors revenue_os_store pattern)
│   ├── profile.json                ← Business profile (name, segment, offer, target)
│   ├── icp_definition.json         ← Ideal Customer Profile definition
│   ├── signal_library.json         ← Signal definitions with weight/timing
│   ├── positioning.json            ← Market positioning data
│   ├── competitor_radar.json       ← Competitive intelligence
│   ├── personas.json               ← Buyer persona library
│   ├── campaigns.json              ← Campaign records
│   ├── scoring_outputs.json        ← Cached scoring results
│   └── weekly_updates.json         ← Weekly GTM update history
├── routers/
│   └── gtm_layer.py                ← 9 REST endpoints (FastAPI)
└── services/
    └── empire_gtm_layer.py         ← Core GTM logic: scoring, signals, campaigns, sequences

lib/
└── gtmLayerApi.ts                  ← Frontend API client

app/
├── revenue-os/page.tsx             ← Full GTM Layer Panel in cockpit
├── try-revenue-os/page.tsx         ← Simple GTM intelligence in public try flow
```

## Scoring Model

### ICP Fit (70 points)
| Component | Max | Description |
|-----------|-----|-------------|
| Buyer fit | 25 | Segment overlap, persona type match, offer alignment |
| Urgency fit | 20 | Time sensitivity, budget readiness, pain intensity |
| Budget/pain fit | 15 | Budget range match, pain point severity |
| Delivery fit | 10 | Ability to deliver given constraints |

### Signal Score (30 points)
| Component | Max | Description |
|-----------|-----|-------------|
| Active signal | 20 | Matching signal from signal library |
| Recency/strength | 10 | Signal recency and strength multiplier |

### Tiers
| Score Range | Tier | Priority |
|-------------|------|----------|
| 80–100 | Tier 1 | Highest priority — outreach immediately |
| 60–79 | Tier 2 | Warm — nurture sequence |
| 40–59 | Tier 3 | Monitor — low-touch email |
| 20–39 | Monitor | Watch — no outreach |
| 0–19 | Exclude | Exclude from campaign |

## Endpoints

All under `/api/gtm`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/context` | Load full GTM context |
| POST | `/context` | Update GTM context |
| POST | `/score-account` | Score a single account |
| POST | `/score-buyers` | Score multiple buyer profiles |
| POST | `/detect-signals` | Detect GTM signals for a business |
| POST | `/signal-to-sequence` | Build outreach sequence from signal |
| POST | `/campaign-plan` | Generate campaign plan from Revenue OS output |
| GET | `/campaigns` | List all campaigns |
| POST | `/weekly-update` | Generate weekly GTM update |

## Revenue OS Integration

The GTM layer attaches to Revenue OS output automatically. Every `/api/revenue-os/run` response includes a `gtm_layer` block with:

- `gtm_signals` — Detected market signals
- `icp_scores` — Buyer profile scores with tiers
- `buyer_tiers` — Tiered buyer list
- `detected_signals` — Active signals with strength
- `recommended_campaign` — Suggested campaign name
- `campaign_summary` — Campaign description
- `sequence_plan` — Multi-step outreach sequence
- `gtm_next_actions` — Actionable follow-ups

## Public Try Flow

The try flow (`/try-revenue-os`) shows three simple GTM cards:
1. **Best buyers to target** — Top 3 scored/tiered buyer profiles
2. **Why now** — Top 2 detected signals with strength
3. **Recommended** — Campaign summary text

Full GTM panel lives in the Revenue OS cockpit (`/revenue-os` → "GTM Layer" tab).

## Development

### Persistence
All data lives in `backend/app/data/gtm/` as JSON files. Create/edit these to seed GTM context:

- `profile.json`: Your business profile
- `icp_definition.json`: Ideal customer segments/attributes
- `signal_library.json`: Signals with channel, strength defaults
- `personas.json`: Buyer personas with attributes

### Adding a new signal
1. Add to `signal_library.json` with `name`, `strength`, `target_segments`, `channel`, `urgency`
2. The `detect_signals` function will match against business data automatically

### Customizing scoring
Edit `score_buyer_profile` in `empire_gtm_layer.py`:
- Adjust weights (buyer_fit, urgency_fit, budget_pain_fit, delivery_fit)
- Modify matching logic for segments/personas
- Change tier thresholds

## Future

- Integration with last30days-skill for real-time signal detection
- External CRM sync (HubSpot, Salesforce)
- Automated sequence execution via email/LinkedIn APIs
- Campaign performance tracking and attribution
- ML-based scoring model
