# Empire-1 Controlled Publisher

Status: implementation branch  
Owner: Empire-1 founder  
Admin surface: `/admin/gtm` → **Controlled Publisher**  
Primary offer: `https://empire1.cloud/services/scan`

## What this closes

The Viral Content Engine already creates proof-backed content, but generated copy alone does not create distribution. The Controlled Publisher adds the missing governed execution path:

1. Create a campaign in `DRAFTED` state.
2. Confirm claims and scope as the founder.
3. Authorize named channels, a maximum action count, and an expiration.
4. Queue explicit publish jobs with one destination per email action.
5. Dispatch one job or the next governed batch of 10 through a configured provider.
6. Record a cryptographic receipt for every state change.
7. Record replies, conversions, verified outcomes, and related CRM activity.

No job becomes `DISPATCHED` unless the configured provider returns a successful response.

## Campaign states

- `DRAFTED`
- `FOUNDER_APPROVED`
- `AUTHORIZED`
- `ACTIVE`
- `PAUSED`
- `COMPLETED`
- `REVOKED`

## Job states

- `QUEUED`
- `DISPATCHING`
- `DISPATCHED`
- `MANUAL_READY`
- `BLOCKED`
- `FAILED`

## Environment configuration

Set these on the Next.js deployment that serves `empire1.cloud`:

```bash
# Required control boundary
EMPIRE_PUBLISHER_KEY=<long-random-founder-key>

# Required durable store; uses the same naming fallbacks as the Empire-1 backend
MONGO_URL=<mongodb-connection-string>
DB_NAME=<empire-database-name>

# External execution gate
EMPIRE_PUBLISHER_ENABLED=true
GTM_PUBLISH_DRY_RUN=false

# Direct email through Resend
RESEND_API_KEY=<resend-api-key>
SENDER_EMAIL="Empire-1 <founder@empire1.cloud>"

# LinkedIn, DM, or newsletter adapter through n8n, Make, Zapier, or an owned publisher service
GTM_PUBLISH_WEBHOOK_URL=<https-webhook-url>
GTM_PUBLISH_WEBHOOK_TOKEN=<optional-bearer-token>
```

Until `EMPIRE_PUBLISHER_ENABLED=true` and `GTM_PUBLISH_DRY_RUN=false`, dispatch attempts are honestly recorded as `BLOCKED` rather than falsely marked published.

## Provider contract

The social webhook receives:

```json
{
  "event": "empire1.controlled_publish",
  "campaign": {
    "id": "CMP-...",
    "name": "Workflow Leak Snapshot — 7 Day Launch",
    "offer_name": "Free AI Workflow Leak Snapshot",
    "primary_url": "https://empire1.cloud/services/scan"
  },
  "job": {
    "id": "PUB-...",
    "channel": "linkedin",
    "destination": "founder-linkedin-profile",
    "subject": null,
    "content": "...",
    "content_sha256": "...",
    "metadata": {}
  }
}
```

Return any `2xx` response to accept the action. An optional `id` or `external_id` is stored on the receipt.

## Anti-spam and founder-control rules

- Every campaign requires founder approval before authorization.
- Authorization expires and has a hard maximum action count.
- Each email job accepts exactly one recipient.
- A queue request is limited to 50 explicit jobs.
- Batch dispatch is capped at 20 per API call and the admin console runs 10 at a time.
- A rolling 24-hour campaign limit blocks excess sends.
- Duplicate content/target combinations are skipped inside the same campaign.
- Secrets are never accepted in campaign or job payloads.
- The founder key is stored only in browser `sessionStorage` by the admin UI.
- Revoking a campaign blocks remaining queued jobs.
- Replies and conversions are recorded as separate outcomes, not inferred.

## First launch sequence

1. Open `/admin/gtm`.
2. Enter the founder operator key.
3. Create `Workflow Leak Snapshot — 7 Day Launch`.
4. Approve the claims and scope.
5. Authorize the seven-day campaign.
6. Queue the founder LinkedIn post plus named email and DM targets.
7. Dispatch only after provider status shows live.
8. Record `REPLIED`, `CONVERTED`, or `VERIFIED` outcomes as they occur.
9. Review the receipt chain and Revenue OS CRM activity.

## Honest activation boundary

The code can create, approve, authorize, queue, dispatch, receipt, and track outcomes. It cannot manufacture provider credentials or LinkedIn platform approval. Resend and the owned social publishing webhook must be configured in deployment before real external delivery can occur.
