# Empire-1 Verified CRM Prospecting Bridge

## Why this exists

FABLE-5 and other agent sessions can research public account signals, but they
must not invent companies, people, titles, or email addresses. This bridge gives
those agents a narrow, authenticated way to place grounded prospects into the
existing Empire-1 Revenue OS CRM and receive evidence receipts.

The CRM remains the commercial system of record. FABLE is a research and
verification client, not a second CRM.

## Runtime contract

Set these variables on the Empire-1 backend:

```bash
CRM_INTEGRATION_KEY="$(openssl rand -hex 32)"
MONGO_URL="mongodb://localhost:27017"
DB_NAME="hybrid_intelligence"
```

Set these variables wherever the FABLE client runs:

```bash
EMPIRE_CRM_URL="https://<backend-host>/api/crm"
CRM_INTEGRATION_KEY="<same secret>"
```

Never commit the real integration key.

## Trust rules

1. Every imported prospect requires a public `source_url`.
2. Every imported prospect requires a plain-language `source_evidence` note.
3. Email addresses are never assumed verified. The accepted states are
   `unknown`, `unverified`, `verified`, and `bounced`.
4. The outreach-ready endpoint returns email only when it is marked `verified`.
   A grounded LinkedIn URL may be returned as a LinkedIn channel.
5. Receipts are append-only. Verification creates a child receipt rather than
   changing the original.
6. `VERIFIED` means an independent verifier reproduced the evidence. A failed
   reproduction creates a `contradicted` receipt.
7. Lead deletion is a soft archive. Activities and receipts remain preserved.

## Connector check

```bash
cd backend
python scripts/fable_crm_bridge.py manifest
```

A healthy result reports `schema_version: 1.0.0` and the policy
`fabricated_contacts: forbidden`.

## Import grounded prospects

Create `prospects.json`:

```json
{
  "source_system": "fable",
  "batch_id": "receipts-design-partners-2026-07-28",
  "prospects": [
    {
      "name": "Platform / DevEx Lead",
      "company": "Example Company",
      "title": "Platform Engineering leader",
      "persona": "Buyer responsible for agent reliability",
      "domain": "example.com",
      "linkedin_url": "https://www.linkedin.com/company/example",
      "contact_email": null,
      "email_verification_status": "unknown",
      "source_url": "https://example.com/careers/platform-engineer",
      "source_evidence": "The company is hiring a platform engineer to support AI-assisted development workflows.",
      "outreach_angle": "Agents say tests passed; Receipts independently reproduces the proof before merge.",
      "lane": "receipts",
      "estimated_value": 6000,
      "tags": ["design-partner", "devex", "agent-reliability"],
      "external_id": "example-platform-signal-20260728"
    }
  ]
}
```

Import it:

```bash
python scripts/fable_crm_bridge.py import prospects.json
```

The result separates `created`, `updated`, and `rejected`. Re-running the same
batch is idempotent at the receipt layer and reconciles the lead instead of
blindly duplicating it.

## Read outreach-ready prospects

```bash
python scripts/fable_crm_bridge.py ready --limit 50
```

The returned `outreach_channel` is either:

- `email` — only for a verified email address.
- `linkedin` — when a grounded LinkedIn URL exists.

A guessed or merely plausible email never becomes outreach-ready.

## Record an outreach receipt

Create `outreach-receipt.json`:

```json
{
  "lead_id": "<crm lead id>",
  "event_type": "outreach_sent",
  "source_system": "fable",
  "actor": "founder-approved-outreach",
  "evidence_ref": "gmail://message/<provider-message-id>",
  "evidence_payload": {
    "channel": "email",
    "template_version": "receipts-design-partner-v1",
    "approved_by": "founder"
  },
  "idempotency_key": "outreach:<lead-id>:<provider-message-id>"
}
```

Append it:

```bash
python scripts/fable_crm_bridge.py receipt outreach-receipt.json
```

## Independently verify a receipt

Create `verification.json`:

```json
{
  "reproduction_status": "passed",
  "verifier": "evidence-auditor",
  "evidence_ref": "gmail://message/<provider-message-id>",
  "notes": "Provider record confirms the message was sent to the approved recipient.",
  "idempotency_key": "verify:<receipt-id>:evidence-auditor-v1"
}
```

Run:

```bash
python scripts/fable_crm_bridge.py verify <receipt-id> verification.json
```

A failed check uses `"reproduction_status": "failed"` and creates a
`contradicted` child receipt.

## Operator UI

The CRM command center is available at:

```text
https://empire1.cloud/crm
```

It shows:

- grounded lead count;
- total and probability-weighted pipeline value;
- due follow-ups;
- verified and contradicted receipts;
- an eight-stage pipeline board;
- a quick grounded-lead form;
- explicit email-verification labels.

## API endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/crm/integrations/manifest` | Connector capabilities and trust policy |
| `POST` | `/api/crm/integrations/prospects/import` | Grounded bulk prospect import |
| `GET` | `/api/crm/integrations/prospects/outreach-ready` | Safe outreach queue |
| `POST` | `/api/crm/receipts` | Append an evidence receipt |
| `POST` | `/api/crm/receipts/{id}/verify` | Append independent verification |
| `GET` | `/api/crm/follow-ups/due` | Due follow-up queue |
| `POST` | `/api/crm/follow-ups/{lead_id}/complete` | Complete and reschedule a follow-up |
| `GET` | `/api/crm/metrics` | CRM and receipt metrics |

Integration endpoints require the `X-CRM-Integration-Key` header.

## Remaining deployment work

The code does not create a secret or deploy itself. Before live prospecting:

1. Generate and store `CRM_INTEGRATION_KEY` in the backend host.
2. Deploy the branch and confirm MongoDB is connected.
3. Set `EMPIRE_CRM_URL` and the same key in the FABLE runtime.
4. Run `manifest`.
5. Import one test account with a real public source.
6. Confirm it appears in `/crm`.
7. Verify that an unverified email is excluded from `outreach-ready`.
8. Rotate the key immediately if it appears in logs, chat, or source control.
