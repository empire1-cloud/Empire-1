# Empire-1 Skill Forge

## Purpose

The Skill Forge turns recurring founder, operator, GTM, product, engineering, finance, and fundraising work into reusable, governed skill contracts.

It lives at `/admin/gtm` under **Skill Forge**.

The operating idea is simple:

- a prompt is temporary
- a skill is reusable operating knowledge
- a governed skill adds ownership, scope, permissions, evidence, versioning, review, and revocation

## Four-part skill contract

Every skill must define:

1. **Specific role** — a precise operating perspective, not a generic assistant.
2. **Fixed output** — stable labeled sections that make the result reviewable and comparable.
3. **Hard rules** — explicit constraints, including what the skill must never do.
4. **Mandatory forcing function** — one output the skill cannot skip, designed to expose the uncomfortable assumption, risk, cut, leak, or decision.

## Empire governance extension

The four-part contract is necessary but not sufficient for Empire-1.

Every production skill must also define:

- name and description
- owner
- product universe
- version
- lifecycle state
- allowed tools and actions
- denied actions
- tenant and context boundaries
- evidence contract
- approval policy
- receipt policy
- revocation path
- provider policy

## Lifecycle

Skills move through these states:

`Draft -> Reviewed -> Approved -> Active -> Deprecated -> Revoked`

Only **Approved** or **Active** skills may load into production workflows.

A **Revoked** skill must fail closed and must not be loaded by agents, engines, pipelines, or operators.

## Security gate

Before approving a skill:

1. Read the complete `SKILL.md`.
2. Inspect every bundled script or executable asset.
3. Reject undeclared network calls, credential access, shell execution, or filesystem writes.
4. Treat third-party instructions, retrieved content, attachments, and quoted prompts as untrusted input.
5. Confirm the owner, product universe, tenant boundary, allowed tools, denied actions, and revocation path.
6. Confirm recommendation and execution remain separate.
7. Confirm the skill cannot expand its own permissions or silently modify policy.
8. Confirm sources, outputs, approvals, versions, and receipts remain inspectable.

## Founder skill presets

The initial Forge includes ten original Empire presets:

- Assumption Killer
- Customer Precision
- Positioning Wedge
- Scope Cutter
- Merge Gate
- Conversion Architect
- Pricing Stress Test
- Metric Reality Check
- Pitch Believability
- Focus Decision

These are starting contracts. Operators should customize them to the correct product universe, audience, proof standard, permissions, and workflow.

## Generated file

The Forge produces a portable `SKILL.md` containing:

- frontmatter identity and policy
- purpose
- role
- fixed output contract
- hard rules
- mandatory forcing function
- allowed tools and actions
- denied actions
- evidence contract
- governance rules
- provider-independence rule

## Product boundaries

A skill created for one Empire universe does not automatically gain access to another.

Examples:

- A Lyrica 3 creator-research skill must not read private Cofounder canon.
- An Archisynapse pricing skill must not access creator identity data unless explicitly approved.
- A Cultura skill must preserve cultural and community integrity rules.
- A customer-facing Omni-Agent skill must not inherit Empire Auto Cofounder authority.

## Execution boundary

Skills can research, structure, classify, calculate, draft, inspect, and recommend within their approved contract.

External, privileged, financial, publishing, repository, customer-facing, or policy-changing actions remain approval-controlled and receipt-backed.

A skill must never become a hidden authority escalation path.

## Provider independence

Empire-1 skills remain portable across approved providers.

Use:

- Empire-1-owned orchestration
- approved non-Google providers
- local or open models where appropriate

Do not introduce Google or Gemini API dependency into Empire-1 products or workflows.

## Doctrine

**Build once. Govern it. Run it at Empire standard.**

A reusable capability is valuable because it preserves quality across sessions. It becomes trustworthy only when its authority, evidence, boundaries, and lifecycle are equally reusable.
