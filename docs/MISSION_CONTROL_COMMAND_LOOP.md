# Empire-1 Mission Control Command Loop

## Status

This route is an approval-controlled **demo harness** at `/mission-control`.

It demonstrates the founder command loop without claiming production execution, live customer traffic, durable settlement, cryptographic anchoring, or a connected Fable 5 runtime.

## Canonical boundary

- **Manda** is final authority.
- **Private Cofounder** observes, analyzes, and proposes. It is not for sale and cannot grant itself authority.
- **SLA113 / Revenue Agent Gateway** evaluates agent identity, action authority, policy, and approval requirements.
- **TransactionService** owns the financial execution lifecycle.
- **Archisynapse** reconciles external provider, ledger, and CRM observations and returns economic truth to the control plane.
- **HIC / Fable 5** remains visibly not connected until a real governed adapter exists.
- **Omni-Agent** remains the separate customer-facing product.

## Implemented proof loop

1. A simulated Lyrica 3 signal is visible in Mission Control.
2. `ENGAGE COFOUNDER` attaches the signal to a structured, read-only proposal.
3. `ram_2005` remains held as an A4 material refund action.
4. The Approval Center exposes manifest scope, evidence, policy, expected economic effect, and founder controls.
5. `APPROVE ONCE` grants authority only to the declared manifest, amount, customer, and idempotency key.
6. The sandbox progression records:
   - TransactionService submitted
   - PSP confirmed
   - Ledger confirmed
   - CRM confirmed
   - Final reconciliation verified
7. A new demo receipt reference appears in the Audit Ledger.
8. `DENY` records a denial receipt without calling an execution adapter.
9. `REQUEST EVIDENCE` keeps execution frozen.

## Persistence

The current harness stores demo state in browser `localStorage` under:

```text
empire1:mission-control:command-loop:v1
```

This is intentionally not presented as production durability. The Demo Mode button resets the fixture.

## Production seams

The following must be replaced before a production claim:

- browser-local state -> authenticated durable state store;
- timed stage progression -> signed service events/webhooks;
- demo receipt references -> canonical signed receipts;
- simulated PSP/ledger/CRM observations -> real scoped adapters;
- static founder identity -> authenticated founder session and step-up authorization;
- UI-only denial/approval -> server-side authorization enforcement;
- fixture evidence -> immutable evidence references and source hashes;
- demo reconciliation -> Archisynapse production reconciliation policies.

## Manual acceptance path

Open `/mission-control` and verify:

1. Mission Control shows one pending approval and 19 seed receipts.
2. Engage Cofounder and inspect the structured proposal.
3. Open the pending approval.
4. Confirm the screen states that no financial execution has occurred.
5. Select `APPROVE ONCE`.
6. Observe the bounded stages advance to `VERIFIED`.
7. Confirm the Audit Ledger now includes `demo_476f113f03`.
8. Reset Demo Mode and select `DENY`; confirm no execution stage starts and a denial receipt is recorded.

## Doctrine

> No authority without a charter.  
> No action without policy.  
> No material risk without approval.  
> No execution without verification.  
> No revenue without a receipt.
