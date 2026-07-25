# Empire-1 Viral Content Engine

## Audit-to-Verdict Pattern

The Viral Content Engine turns verified product evidence into authority-building content without flattening the Empire-1 product universes.

Core pattern:

> Huge universe → brutal filter → surprising result → specific proof

The engine is available in the Empire-1 admin GTM surface at `/admin/gtm` under **Viral Engine**.

## What it generates

One audit produces:

- A high-contrast headline and subheadline
- A written verdict
- A LinkedIn authority post
- A seven-slide carousel
- A 40-second short-video script
- Newsletter subject lines and opening copy
- A proof-before-publish checklist
- Integrity rules that block unsupported claims
- A saved content-pack record in MongoDB

## API

### Create a pack

`POST /api/gtm/viral-audit-packs`

```json
{
  "product_universe": "Empire-1",
  "audited_subject": "AI engines",
  "total_examined": "245+",
  "survivors": "Only the proof-backed engines",
  "proof_basis": "tests, receipts, release evidence, and live workflow output",
  "audience": "founders, operators, buyers, and investors",
  "objective": "Turn product proof into authority-building content",
  "call_to_action": "Open the evidence trail",
  "channels": ["linkedin", "carousel", "short_video", "newsletter"]
}
```

### List saved packs

`GET /api/gtm/viral-audit-packs`

### Fetch one saved pack

`GET /api/gtm/viral-audit-packs/{pack_id}`

## Empire presets

The UI ships with separate presets for:

- Empire-1
- Lyrica 3
- Archisynapse
- Cultura Vibe Forge
- Empire Auto Cofounder
- San Bernardino Youth Tech

Each preset preserves its own product boundary, audience, proof standard, and call to action.

## Proof gate

A post should not ship until the operator can answer yes to all of these:

1. Is the complete audit universe defined?
2. Was one written survival standard applied to every candidate?
3. Does every major claim point to a test, receipt, artifact, metric, or source?
4. Are verified facts separated from estimates and founder interpretation?
5. Are exclusions and failures documented rather than quietly removed?
6. Does the conclusion teach an operational lesson instead of ending as a generic pitch?

## Integrity rules

- Never invent the total examined or survivor count.
- Do not use the word “audit” unless the selection standard is documented.
- Keep Cultura Vibe Forge cultural claims tied to its own authenticity rules and evidence.
- Never flatten separate Empire-1 product universes into one generic product.
- Label unverified claims before publication.

## Example headlines

### Empire-1

> 245+ AI Engines. Which Ones Can Actually Produce Proof?

### Lyrica 3

> One Song. Six Proof Layers. No Lost Ownership.

### Archisynapse

> Every Payment Platform Tracks Money. We Tracked the Receipt.

### Cultura Vibe Forge

> Thousands of AI Outputs. How Many Actually Respect the Cultura?

### Empire Auto Cofounder

> Dozens of AI Agents. Only the Evidence Gets Promoted.

### San Bernardino Youth Tech

> 10 Young Creators. 30 Days. Zero Gatekeeping.
