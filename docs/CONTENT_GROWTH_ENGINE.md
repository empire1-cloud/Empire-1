# Empire-1 Content Growth Engine

## Status

Built as an additive upgrade to the existing `/admin/gtm` Viral Content Engine.

Operating rule: **WE EVOLVE. NEVER DELETE.** Existing viral audit packs remain readable and the original `/gtm/viral-audit-packs` API contract remains available.

## Purpose

Turn verified Empire-1 activity into sustained audience growth, qualified conversations, creator adoption, partnerships, investor interest, and measurable revenue.

The engine operates through:

`DISCOVER → VERIFY → CREATE → DISTRIBUTE → CONVERT → LEARN → REUSE`

## Protected universe lanes

Every signal, content pack, metric record, and learning note belongs to exactly one lane:

- Empire-1
- Lyrica 3
- Archisynapse
- Cultura Vibe Forge
- HIC / Empire Auto Cofounder
- Southern Lifestyle
- Founding 8 Youth Tech

Legacy names are normalized without deleting history:

- `Empire Auto Cofounder` → `HIC / Empire Auto Cofounder`
- `San Bernardino Youth Tech` → `Founding 8 Youth Tech`

Cultura Vibe Forge remains separate from Lyrica 3, generic community content, and Youth Tech.

## Evidence model

Every item is classified as one of:

1. `external_signal` — supported by a named source and never presented as an Empire-1 achievement.
2. `empire_proof` — supported by a test, receipt, artifact, metric, screenshot, deployment, customer result, or other proof reference.
3. `founder_perspective` — Manda's analysis or belief, clearly labeled as interpretation.
4. `unverified_claim` — preserved for review but blocked from publish-ready status.

Performance claims require a Proof Strength score of at least 70. Empire Proof also requires a proof reference. Universe Alignment must be at least 70.

## Story patterns

- Audit → brutal filter → surprising result → specific proof
- Problem → failed industry assumption → Empire answer → proof
- Founder struggle → decision → build → result
- Signal → why it matters → Empire position → next action
- Build receipt → lesson → invitation

## Generated pack

A governed pack can include:

- Five hooks
- LinkedIn authority post
- Seven-slide carousel
- 40-second vertical-video script
- Three short posts
- Newsletter subjects and opening
- Investor proof message
- Call to action
- Five-day distribution sequence
- Proof-before-publish checklist
- Integrity rules

## Distribution boundary

The engine prepares a five-day sequence:

1. Authority
2. Conversation
3. Proof
4. Personalized outreach
5. Conversion

Every stage is marked as approval-required. The system does not publish, email, or send direct messages automatically.

## Analytics

The analytics lane stores:

- Reach
- Saves
- Qualified comments
- Profile visits
- Direct messages
- Applications
- Meetings
- Attributed revenue
- Hook
- Format
- Proof asset
- Product universe
- Linked content pack

The command board summarizes totals and calculates a content conversion rate from direct messages, applications, and meetings divided by reach.

## Learning library

The learning lane preserves:

- Audience objections
- Winning hooks
- Failed angles
- Conversion insights
- Reusable proof assets

Each note is assigned a reuse action: repeat, improve, adapt, or retire without deleting.

## API additions

All routes remain under `/gtm`.

### Signals

- `POST /content-growth/signals`
- `GET /content-growth/signals`

### Metrics

- `POST /content-growth/metrics`
- `GET /content-growth/metrics`

### Learning

- `POST /content-growth/learnings`
- `GET /content-growth/learnings`

### Command board

- `GET /content-growth/dashboard`

### Pack approval state

- `PUT /viral-audit-packs/{pack_id}/status`

Allowed states:

- draft
- proof_review
- approved
- scheduled
- published
- retired

Founder approval is required before approved, scheduled, or published states. Proof blockers must be resolved before advancement.

## Persistence

MongoDB collections:

- `gtm_viral_audit_packs`
- `gtm_content_signals`
- `gtm_content_metrics`
- `gtm_content_learnings`

## Interface

The `/admin/gtm` engine keeps the black cinematic Empire-1 visual system and now includes:

- Command board
- Create
- Signal intake
- Growth analytics
- Learning library
- History

The history view keeps legacy packs accessible alongside the new `content-growth-v1` packs.

## Validation

- Python router syntax compiled locally with `python3 -m py_compile`.
- React/TypeScript surface transpiled locally with TypeScript 5.8.
- Pure backend tests cover survival-rate parsing, legacy aliases, proof gates, full pack generation, approval-required distribution, and Cultura Vibe Forge separation.
