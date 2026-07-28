# Empire-1 Paid Media Governance

Status: implementation complete; external spend remains sealed until deployment credentials and Empire-owned provider gateways are configured.

## Purpose

This layer lets Empire-1 operate Meta Ads, Google Ads, and X Ads without granting the Cofounder an unrestricted advertising budget.

Paid campaigns move through:

`DRAFTED → CREATIVE_APPROVED → BUDGET_AUTHORIZED → LIVE → PAUSED / AUTO_PAUSED / REVOKED`

A launch cannot happen until all three boundaries exist:

1. Creative and claims approval.
2. Ad-account and direct-billing confirmation.
3. A dated, expiring budget authorization with daily and total caps.

## Controls

- Platform-specific ad-account IDs are required.
- The client or Empire pays the advertising platform directly through the connected ad account.
- Daily and total caps are sent to the provider gateway on launch.
- A budget cannot be changed while a campaign is live.
- Budget increases require an explicit increase confirmation and a new receipt revision.
- Authorizations expire after at most 90 days.
- Campaigns may auto-pause when:
  - total authorized spend is reached;
  - authorization expires;
  - spend reaches the approved no-conversion threshold;
  - cost per conversion exceeds the approved maximum.
- A pause enters `PAUSE_REQUESTED` until every live provider confirms the stop.
- Every approval, authorization, launch, spend sync, pause, failure, and revocation receives a SHA-256 receipt.

## Deployment variables

```bash
EMPIRE_PAID_MEDIA_KEY=<founder-secret>
# Falls back to EMPIRE_PUBLISHER_KEY when omitted.

MONGO_URL=<mongo-uri>
DB_NAME=<database-name>

EMPIRE_PAID_MEDIA_ENABLED=true
GTM_PAID_MEDIA_DRY_RUN=false

# One Empire-owned gateway can route all platforms:
GTM_PAID_MEDIA_GATEWAY_URL=https://<empire-owned-gateway>/paid-media
GTM_PAID_MEDIA_GATEWAY_TOKEN=<gateway-secret>

# Or configure separate Empire-owned adapters:
GTM_PAID_MEDIA_META_GATEWAY_URL=https://<gateway>/meta
GTM_PAID_MEDIA_GOOGLE_GATEWAY_URL=https://<gateway>/google-ads
GTM_PAID_MEDIA_X_GATEWAY_URL=https://<gateway>/x-ads
```

## Gateway contract

Empire-1 sends:

```json
{
  "event": "empire1.paid_media.launch",
  "platform": "meta",
  "campaign": {
    "id": "ADS-...",
    "name": "Workflow Leak Snapshot — Paid Funnel Test",
    "landing_url": "https://empire1.cloud/services/scan",
    "creative": {},
    "authorization": {
      "currency": "USD",
      "daily_cap_cents": 2000,
      "total_cap_cents": 14000,
      "platform_accounts": { "meta": "act_..." }
    },
    "provider_binding": {}
  },
  "input": {}
}
```

Supported events:

- `empire1.paid_media.launch`
- `empire1.paid_media.pause`
- `empire1.paid_media.sync`
- `empire1.paid_media.revoke`

Launch responses may include:

```json
{
  "campaign_id": "provider-campaign-id",
  "ad_group_id": "provider-ad-group-id",
  "budget_id": "provider-budget-id",
  "message": "Campaign launched with provider-native caps."
}
```

Sync responses must include provider-reported cumulative metrics in cents:

```json
{
  "message": "Metrics synced.",
  "metrics": {
    "spend_cents": 2700,
    "impressions": 12000,
    "clicks": 190,
    "conversions": 3,
    "conversion_value_cents": 300000
  }
}
```

## Provider responsibilities

The Empire-owned gateway is responsible for translating the approved model into each platform's native campaign, budget, ad group, creative, targeting, and pause calls. It must also apply the provider-native daily or lifetime cap rather than relying only on periodic monitoring.

The governance layer does not claim that a pause succeeded until the provider gateway returns success. Failed pauses stay visible as `PAUSE_REQUESTED`.
