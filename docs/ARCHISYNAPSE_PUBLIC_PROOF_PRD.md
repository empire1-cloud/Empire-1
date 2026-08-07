# Archisynapse Public Proof — PRD

## Goal

Publish a meeting-ready Archisynapse proof surface at `/archisynapse` without representing the current backend as production-ready or implying live money movement.

## Source of truth

- Canonical implementation repository: `empire1-cloud/archisynapse-v2`
- Product boundary: Archisynapse is an independent Empire-1 universe and the ledger, receipt, risk, and payment-orchestration rail used by products such as Lyrica 3.
- Governance boundary: Fable-5 governs intent, evidence, authorization, and release policy; Archisynapse owns the financial execution boundary.
- Current processor boundary: external processing is disabled by default.

## Scope

- Explain the governed royalty path from a Lyrica ownership event to an Archisynapse receipt.
- Show the current implementation status and remaining release gates.
- Provide an interactive, deterministic sandbox visualization of a balanced royalty obligation.
- Provide a second interaction proving that an external settlement attempt fails closed while the processor is disabled.
- Link the public ecosystem navigator to the new route.

## Non-goals

- No payment-processor call.
- No card, bank, wallet, or customer data.
- No claim of production readiness, certification, uptime, throughput, settlement speed, or live payouts.
- No fabricated signature or backend receipt.
- No claim that the sandbox fixture is already a signed Fable-5 token exchange.
- No deployment of the multi-service financial backend before its database, secrets, processor sandbox, and recovery gates are verified.

## Acceptance criteria

1. `/archisynapse` builds and renders as a public Empire-1 route.
2. The page labels the interaction as an interface proof and states that no money moves.
3. The sandbox journal remains balanced: debit total equals credit total.
4. The external-settlement action resolves to `BLOCKED`, with the disabled processor identified as the governing rule.
5. The page distinguishes implemented code from pending deployment proof.
6. The ecosystem navigator links to `/archisynapse` and keeps Archisynapse in active development.
