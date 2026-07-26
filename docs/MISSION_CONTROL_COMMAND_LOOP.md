# Empire-1 Mission Control Command Loop

## Status

The founder command-loop demo lives at `/mission-control`.

The route now includes a **real, server-side, read-only Fable 5 execution connection** to the Empire Auto Cofounder API. The surrounding refund, PSP, CRM, and ledger progression remains a clearly labeled demo harness and does not claim production settlement, live customer traffic, or cryptographic anchoring.

## Canonical boundary

- **Manda** is final authority.
- **Private Cofounder** observes, analyzes, and proposes. It is not for sale and cannot grant itself authority.
- **Fable 5** is the private control-plane surface for durable Cofounder execution visibility.
- **SLA113 / Revenue Agent Gateway** evaluates agent identity, action authority, policy, and approval requirements.
- **TransactionService** owns the financial execution lifecycle.
- **Archisynapse** reconciles external provider, ledger, and CRM observations and returns economic truth to the control plane.
- **HIC model orchestration** remains separate from the Fable 5 execution link until the old provider map is migrated to the approved non-Google stack.
- **Omni-Agent** remains the separate customer-facing product.

## Fable 5 connection

Mission Control exposes:

- `GET /api/mission-control/fable` — server-side status bridge;
- `/mission-control/fable` — detailed connection and durable-job view;
- health from the Cofounder `/execution/health` endpoint;
- the latest durable jobs from `/execution/jobs`;
- receipt count and receipt-chain validation state;
- fail-closed states: `NOT CONFIGURED`, `OFFLINE`, and `DEGRADED`.

The browser never receives the private upstream API URL or optional bearer token. Configure:

```text
FABLE5_EXECUTION_API_URL=https://<private-cofounder-api>
FABLE5_EXECUTION_BEARER_TOKEN=<optional-server-only-token>
```

`COFOUNDER_API_URL` remains a supported fallback name for the base URL.

### Write boundary

The Mission Control bridge is intentionally **read-only**. Its `POST` route returns `405`.

Enqueue and approval writes remain disabled until the following exist:

- authenticated founder session;
- step-up authorization for material actions;
- server-side scope enforcement;
- CSRF protection and request provenance;
- explicit mapping from Mission Control manifests to durable Cofounder job kinds;
- canonical approval and execution receipts.

## Implemented demo proof loop

1. A simulated Lyrica 3 signal is visible in Mission Control.
2. `ENGAGE COFOUNDER` attaches the signal to a structured, read-only proposal.
3. `ram_2005` remains held as an A4 material refund action.
4. The Approval Center exposes manifest scope, evidence, policy, expected economic effect, and founder controls.
5. `APPROVE ONCE` grants authority only to the declared manifest, amount, customer, and idempotency key inside the demo state machine.
6. The sandbox progression records:
   - TransactionService submitted;
   - PSP confirmed;
   - ledger confirmed;
   - CRM confirmed;
   - final reconciliation verified.
7. A new demo receipt reference appears in the Audit Ledger.
8. `DENY` records a denial receipt without calling an execution adapter.
9. `REQUEST EVIDENCE` keeps execution frozen.

## Persistence

The current demo command loop stores local fixture state in browser `localStorage` under:

```text
empire1:mission-control:command-loop:v1
```

The Fable 5 status is not loaded from browser storage. It is refreshed from the server-side bridge every 15 seconds.

## Production seams

The following must still be replaced before the full command loop may make a production claim:

- browser-local demo state -> authenticated durable Mission Control state;
- timed stage progression -> signed service events and webhooks;
- demo receipt references -> canonical signed receipts;
- simulated PSP, ledger, and CRM observations -> real scoped adapters;
- static founder identity -> authenticated founder session and step-up authorization;
- UI-only demo approval -> server-side authorization enforcement;
- fixture evidence -> immutable evidence references and source hashes;
- demo reconciliation -> Archisynapse production reconciliation policies;
- Fable 5 read-only bridge -> separately reviewed write adapter.

## Manual acceptance path

Open `/mission-control` and verify:

1. The Fable 5 connection dock appears and does not claim `LIVE` unless the upstream API responds with `status=ok` and `receipt_chain_valid=true`.
2. Open `/mission-control/fable` and verify durable jobs are listed without payload contents.
3. Mission Control shows one pending demo approval and 19 seed receipts.
4. Engage Cofounder and inspect the structured proposal.
5. Open the pending approval and confirm no financial execution has occurred.
6. Select `APPROVE ONCE` and observe the bounded demo stages advance to `VERIFIED`.
7. Confirm the Audit Ledger now includes `demo_476f113f03`.
8. Reset Demo Mode and select `DENY`; confirm no execution stage starts and a denial receipt is recorded.

## Doctrine

> No authority without a charter.  
> No action without policy.  
> No material risk without approval.  
> No execution without verification.  
> No revenue without a receipt.
