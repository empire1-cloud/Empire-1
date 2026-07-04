---
title: Empire OS Co-Founder v1
status: draft
owner: empire1
updated: 2026-07-03
---

# Empire OS Co-Founder v1

## Purpose

Build a real autonomous operator partner for the Empire ecosystem by extending the existing `omni_agent` execution loop across business surfaces, not by inventing a second competing brain.

This system should:

- plan daily work
- monitor system and business state while the founder is away
- execute safe actions autonomously
- verify its own outputs before claiming success
- escalate only when a decision crosses a defined approval boundary

## Canonical Principle

`sla113/OMNI_AGENT/omni_agent` is the canonical execution loop.

Everything else falls into one of three roles:

1. `tool bank`
   `Empire-1`, `sla113`, and related repos expose APIs, engines, stores, and workflows the co-founder can call.
2. `memory and orchestration substrate`
   `the-homie` contributes memory, scheduling, team, and operator-surface patterns.
3. `non-canonical concept or scaffold`
   Any pseudo-runtime or duplicate orchestrator concept must be archived, mined for ideas, or reduced to docs.

## What Already Exists

### Execution Core

- `sla113/OMNI_AGENT/omni_agent`
  - task scanner
  - triage
  - analyst persona
  - developer persona
  - evaluator persona
  - guardrails
  - SQLite-backed state machine
  - ROI and reporting

### Business State Layer

- `Empire-1/backend/app/routers/crm.py`
- `Empire-1/backend/app/routers/business_analytics.py`
- `Empire-1/backend/app/routers/gtm.py`
- `Empire-1/backend/app/routers/gtm_layer.py`
- `Empire-1/backend/app/routers/revenue_os.py`

### Strategy and Decision Support

- `Empire-1/backend/services/strategy_engine.py`
- `Empire-1/backend/services/opportunity_mapper.py`
- `Empire-1/backend/services/plan_builder.py`
- `Empire-1/backend/services/money_pipeline_engine.py`
- related Hybrid Intelligence engines

### Memory and Scheduling Patterns

- `the-homie` scheduled jobs
- `the-homie` memory and hive surfaces
- `the-homie` team operations and executor patterns

## What Co-Founder v1 Must Do

v1 is not "run the whole company."

v1 is "be a dependable solo-founder operator partner."

### Core Routines

1. `wake_up_brief`
   Produce a ranked brief when the founder returns.

   Inputs:
   - system health
   - open omni tasks
   - CRM metrics
   - business analytics
   - GTM campaign state
   - recent revenue OS activity

   Output:
   - what changed
   - what is blocked
   - what needs attention today
   - recommended next action

2. `daily_goal_plan`
   Turn current state into 3 to 5 clear daily goals.

   Inputs:
   - active repo tasks
   - pipeline risk
   - revenue signals
   - deployment risk

   Output:
   - daily goals
   - why each goal matters
   - what can be delegated to autonomous execution

3. `safe_execution_loop`
   Run approved tasks through the canonical analyst -> developer -> evaluator pipeline or equivalent domain-specific pipeline.

4. `business_watchdog`
   Periodically inspect:
   - health endpoints
   - CRM metrics
   - campaign status
   - stale leads
   - revenue pipeline state
   - pending investor follow-ups

5. `escalation_summary`
   Interrupt the founder only for:
   - money risk
   - production risk
   - deadline risk
   - approval-required actions

## Approval Boundary

The approval boundary must be explicit and enforced in code.

### Auto-Escalate Always

- money movement
- publishing customer-facing claims without approval
- investor outreach send actions
- production deploys outside pre-approved deploy workflows
- edits to strategy, investor, legal, secrets, or compliance-sensitive files
- destructive data mutation

### Safe To Autonomously Do In v1

- read and summarize system state
- score leads and campaigns
- generate daily plans
- update internal task state
- draft outreach, investor, support, and strategy artifacts
- execute code changes only within explicit allowlists
- run tests and evaluations
- generate reports

## Architecture

### 1. Orchestrator

Create a new top-level co-founder module that calls into the canonical `omni_agent` and business APIs.

Proposed location:

`Empire-1/backend/app/services/empire_os_cofounder/`

Suggested files:

- `runtime.py`
- `policy.py`
- `briefing.py`
- `watchdog.py`
- `actions.py`
- `state.py`
- `surfaces.py`

### 2. Memory

The co-founder needs one canonical memory surface for:

- current priorities
- unresolved blockers
- active business risks
- recent decisions
- investor and outreach history
- repo and service status snapshots

v1 can start with file or JSON-backed memory, but it should be structured and append-only where possible.

### 3. Surface Adapters

Each business surface needs an adapter.

Initial adapters:

- `omni_tasks`
- `crm`
- `business_analytics`
- `gtm`
- `revenue_os`
- `system_health`

Future adapters:

- `email_send`
- `investor_tracker`
- `deploy`
- `billing`
- `calendar`

### 4. Policy Engine

Every action must be classified before execution:

- `read_only`
- `draft_only`
- `safe_write`
- `approval_required`
- `forbidden`

No adapter gets blanket write access.

## Capability Matrix

| Capability | Current source | Status | v1 use |
|---|---|---|---|
| Autonomous coding loop | `sla113/OMNI_AGENT` | live | reuse directly |
| Daily ops briefing | `home-agent` + APIs | partial | implement |
| Strategic planning | `strategy_engine` + `cofounder-agent` | partial | implement |
| CRM operations | `crm.py` | live | reuse directly |
| KPI and revenue visibility | `business_analytics.py` | live | reuse directly |
| GTM scoring and sequencing | `gtm_layer.py` | partial-live | reuse directly |
| Revenue system generation | `revenue_os.py` | live MVP | reuse with caveats |
| Email send | `email_service.py` | partial/mocked | gate behind approval |
| Billing and checkout | `billing_service.py` | partial | gate behind approval |
| Scheduled autonomy patterns | `the-homie` | live substrate | copy patterns |
| Unified memory | fragmented | missing | build v1 |

## Surfaces To Reuse vs Retire

### Reuse

- `sla113/OMNI_AGENT/omni_agent`
- `Empire-1` business routers and stores
- `the-homie` scheduling and team patterns

### Retire Or Downgrade

- any pseudo-runtime that claims to be the central orchestrator but is only a scaffold
- duplicate "OS brain" concepts that are not executable

### Important Warning

`Empire-1/backend/app/services/omni_service.py` is not the canonical execution engine.
It is a lighter JSON-state facade and should not be mistaken for the actual orchestrator.

## Build Order

### Phase 1: Unification

1. Declare canonical execution loop in docs and code comments.
2. Create `empire_os_cofounder` module.
3. Add read-only adapters for:
   - system health
   - omni status/tasks
   - CRM metrics
   - business analytics
   - GTM metrics
   - revenue OS analytics/dashboard

### Phase 2: Briefing

1. Implement `wake_up_brief`.
2. Implement `daily_goal_plan`.
3. Persist last brief and last recommended action.

### Phase 3: Watchdog

1. Add scheduled checks.
2. Detect:
   - stale leads
   - draft campaigns lingering too long
   - unhealthy services
   - blocked omni tasks
   - low conversion or pipeline anomalies

### Phase 4: Safe Actioning

1. Allow autonomous internal state updates.
2. Allow task execution through canonical omni paths.
3. Allow draft generation for outreach and investor comms.

### Phase 5: Approval-Gated Actuation

1. Email send
2. Payment and billing actions
3. Deployment triggers
4. External publishing

## First Five Deliverables

1. `GET /api/empire-os-cofounder/brief`
   Returns current founder brief.

2. `GET /api/empire-os-cofounder/goals`
   Returns ranked daily goals.

3. `GET /api/empire-os-cofounder/watchdog`
   Returns current risks and alerts.

4. `POST /api/empire-os-cofounder/run-safe-loop`
   Runs safe autonomous routines only.

5. `GET /api/empire-os-cofounder/audit`
   Returns action log and escalation history.

## Success Criteria For v1

v1 is successful when it can:

- generate a useful wake-up brief without hallucinating state
- identify the next best daily goals from real system data
- autonomously process safe internal tasks
- produce an audit trail for every action
- escalate only when crossing policy boundaries

v1 is not required to:

- negotiate with investors
- spend money
- push marketing live automatically
- run arbitrary writes across the ecosystem

## Immediate Next Step

Implement Phase 1 and Phase 2 first:

- create `empire_os_cofounder` service module
- wire read-only adapters
- expose `/brief` and `/goals`

That gives the founder a real partner loop before expanding actuation.
