# Empire-1 OS Architecture Map

## Prime Directive
WE EVOLVE. NEVER DELETE.

Canon:

- Every repo matters.
- Every repo contains truth.
- We classify, connect, and evolve.
- We do not flatten, replace, or delete.

## Repo Position

`Empire-1` is the parent operating-system repo for the broader empire. Based on `README.md`, `ARCHITECTURE.md`, `ADRS/0001-universe-boundaries.md`, and the folder tree, this repo acts as a multiverse monorepo that mixes:

- parent runtime and governance,
- product surfaces,
- shared infrastructure,
- backend/frontend implementation,
- agent and operator tooling,
- and historical or legacy runtime experiments.

It is not a single-product repo. It is a federated architecture surface.

## System Map

### SLA113 / Parent Runtime
Parent control plane, universe registry, governance, policy, routing, telemetry, runtime contracts, and boundary enforcement.

Primary evidence:
- `/SLA113/`
- `/SHARED/`
- `/ADRS/`
- `/DEPLOY_MAP.md`
- `/ARCHITECTURE.md`
- `/policy.yaml`
- `/middleware.ts`
- `/sla113_clean/`
- `/sla113_console.py`

### Lyrica
Music product universe under the Empire-1 operating layer.

Primary evidence:
- `/backend/app/engines/`
- `/backend/app/services/`
- `/backend/app/workers/`
- `/app/admin/ai-studio/`
- `/app/admin/stem-deck/`
- `/omni_agent/` sales/operator references touching Lyrica-facing workflow
- top-level docs that reference `LYRICA3`, Sonance Pro, SL Universal, and Soulfire

### Archisynapse
Payments, DNA, VICS, royalties, fraud, and ledger/trust lane. In this repo, it appears mostly as shared economic/runtime concern rather than a fully isolated top-level package.

Primary evidence:
- `README.md` governance and royalty language
- `/backend/app/data/revenue_os/`
- `/app/revenue-os/`
- `/app/revenue-receipt/`
- release receipts under `/releases/`

### Cultura
Cultural operating layer, authenticity rules, dialect integrity, heritage logic, and community signal.

Primary evidence:
- `README.md` and `ARCHITECTURE.md` references to `CULTURA_VIBE_FORGE`
- `/backend/app/engines/` and `/backend/app/services/` likely shared engine/service hooks
- `/SHARED/universe_registry.yaml` and ADR governance references

### Southern
Entertainment, arcade, themed experiences, and white-label experience factory lane.

Primary evidence:
- `README.md` universe table and deploy map
- `/public/brand/southern-logo.png`
- `/public/southern-logo.jpg`
- `/firekirin-engine/`
- `/external_projects/`
- routes and assets that imply Southern-facing product surfaces

### Shared Infrastructure
Frontend shell, backend shell, deployment configs, registry, policies, build outputs, static assets, and shared libraries used across universes.

Primary evidence:
- `/app/`
- `/backend/`
- `/components/`
- `/config/`
- `/core/`
- `/lib/`
- `/styles/`
- `/public/`
- `/deployment/`
- `/Dockerfile*`
- `/cloudbuild*.yaml`
- `/railway.toml`
- `/vercel.json`
- `/package.json`
- `/tailwind.config.ts`
- `/postcss.config.js`

### Agents / Automation
Operator tooling, memory, reports, run-state, and automation surfaces that support planning, execution discipline, or local operator behavior.

Primary evidence:
- `/.agents/`
- `/omni_agent/`
- `/memory/`
- `/.codex/`
- `/.emergent/`
- session logs such as `/session-ses_*.md`

### Legacy / Needs Review
Historical runtime experiments, build artifacts, duplicated surfaces, generated folders, local-only assets, and unclear parallel structures that should stay visible until deliberately classified.

Primary evidence:
- `/.next/`
- `/node_modules/`
- `/sla113_clean/`
- `/Empire-1/`
- `/empire-one-sla113/`
- disabled tests `*.disabled`
- `/desktop.ini`
- `/backend/archived/`

## Folder / File Map

| Path | System | Purpose | Status | Notes |
|---|---|---|---|---|
| `/README.md` | SLA113 / Parent Runtime | Multiverse repo framing and universe registry narrative. | Protected | Core source-of-truth doc for repo identity. |
| `/ARCHITECTURE.md` | SLA113 / Parent Runtime | Older architecture abstraction for brain/tool/runtime/law layers. | Protected | Important architecture evidence, but narrower than the newer multiverse framing. |
| `/ADRS/` | SLA113 / Parent Runtime | Accepted architecture decisions and boundary rules. | Protected | High-value governance evidence. |
| `/DEPLOY_MAP.md` | SLA113 / Parent Runtime | Domain-to-service-to-universe mapping. | Protected | Deployment and universe-routing source of truth. |
| `/SHARED/` | SLA113 / Parent Runtime | Shared registry and cross-universe definitions. | Protected | Should remain stable and review-heavy. |
| `/SLA113/` | SLA113 / Parent Runtime | Parent runtime implementation and control-plane assets. | Active | Primary runtime/control lane. |
| `/sla113_clean/` | SLA113 / Parent Runtime | Clean or alternate SLA113 runtime experiment. | Legacy / Needs Review | Likely important history, but parallel-runtime risk exists. |
| `/sla113_console.py` | SLA113 / Parent Runtime | Runtime console/entry support. | Active | Parent-runtime support artifact. |
| `/policy.yaml` | SLA113 / Parent Runtime | Policy and boundary control configuration. | Protected | Governance-critical. |
| `/middleware.ts` | SLA113 / Parent Runtime | Routing/tenant or universe middleware boundary. | Protected | Cross-universe runtime impact. |
| `/app/` | Shared Infrastructure | Next.js app router shell for multiverse product/admin/operator surfaces. | Active | Shared shell, not one universe only. |
| `/app/admin/` | Shared Infrastructure | Admin/operator product surfaces across universes. | Active | Mixed universe responsibilities; keep classified carefully. |
| `/app/admin/ai-studio/` | Lyrica | Creator/AI studio admin surface. | Active | Likely Lyrica-facing studio control surface. |
| `/app/admin/stem-deck/` | Lyrica | Stem/audio operator surface. | Active | Likely tied to Sonance Pro or audio runtime operations. |
| `/app/admin/revenue/` | Archisynapse | Revenue-facing control surface. | Active | Strong commerce/economics signal. |
| `/app/admin/regulatory/` | SLA113 / Parent Runtime | Compliance/governance control surface. | Active | Parent-runtime and policy-adjacent. |
| `/app/dashboard/` | Shared Infrastructure | Shared dashboard shell. | Active | Needs subsystem ownership at route level. |
| `/app/foundry/` | SLA113 / Parent Runtime | Foundry/control-plane UI surface. | Active | Parent runtime/factory lane. |
| `/app/operator/` | Agents / Automation | Operator-facing workflow surface. | Active | Automation/operator OS lane. |
| `/app/revenue-os/` | Archisynapse | Revenue operating surface. | Active | Strong economics lane. |
| `/app/revenue-receipt/` | Archisynapse | Revenue receipt surface. | Active | Financial/ledger evidence. |
| `/app/sla113/` | SLA113 / Parent Runtime | Parent runtime route surface. | Active | Direct runtime evidence. |
| `/backend/` | Shared Infrastructure | FastAPI/backend implementation layer for multiple universes. | Active | Shared backend shell with mixed subsystem ownership. |
| `/backend/app/` | Shared Infrastructure | Main service application package. | Active | Needs subsystem classification at subfolder level. |
| `/backend/app/core/` | Shared Infrastructure | Shared backend core utilities and dependencies. | Protected | Foundational service code. |
| `/backend/app/data/` | Shared Infrastructure | Structured domain data for admin/revenue/ops flows. | Protected | Data-heavy and operationally sensitive. |
| `/backend/app/data/revenue_os/` | Archisynapse | Revenue commands, leads, receipts, and economic records. | Active | Strong economic trust lane. |
| `/backend/app/engines/` | Lyrica | Engine integration points and creative/runtime services. | Active | Most likely mixed Soulfire/Lyrica/Cultura hooks. |
| `/backend/app/models/` | Shared Infrastructure | Shared backend data models. | Active | Cross-domain support layer. |
| `/backend/app/routers/` | Shared Infrastructure | API routing layer. | Active | Mixed route ownership; protect contracts. |
| `/backend/app/services/` | Shared Infrastructure | Backend service layer. | Active | Service boundaries likely cross universes. |
| `/backend/app/workers/` | Lyrica | Worker processes and runtime jobs. | Active | Likely audio/creative/background execution lane. |
| `/backend/archived/` | Legacy / Needs Review | Archived logs and historical backend artifacts. | Legacy / Needs Review | Preserve, do not casually prune. |
| `/components/` | Shared Infrastructure | Shared React components. | Active | Shared UI building blocks. |
| `/config/` | Shared Infrastructure | Project configuration. | Protected | Multi-surface implications. |
| `/core/` | Shared Infrastructure | Shared system core modules. | Protected | Likely foundational cross-universe code. |
| `/lib/` | Shared Infrastructure | Shared library utilities. | Active | Support layer. |
| `/styles/` | Shared Infrastructure | Shared styling and animation utilities. | Active | Presentation infrastructure. |
| `/public/` | Shared Infrastructure | Shared public assets and brand assets. | Active | Mixed brand/universe asset lane. |
| `/public/brand/` | Southern | Southern brand assets. | Protected | Brand source evidence. |
| `/firekirin-engine/` | Southern | Entertainment/arcade or game-engine lane. | Needs Review | Strong Southern signal, needs deeper mapping later. |
| `/external_projects/` | Southern | External or white-label related project area. | Needs Review | Keep visible until classified. |
| `/omni_agent/` | Agents / Automation | Operator OS, sales collateral, and runtime state. | Active | Strong automation/operator lane. |
| `/omni_agent/sales/` | Agents / Automation | Sales/operator collateral. | Docs Only | Operational enablement, not product runtime. |
| `/omni_agent/state/` | Agents / Automation | Task state and operator artifacts. | Protected | State/evidence store. |
| `/memory/` | Agents / Automation | Memory and coordination inputs. | Protected | Planning/evidence lane. |
| `/.agents/` | Agents / Automation | Agent context and instruction storage. | Protected | Agent-ops evidence. |
| `/.emergent/` | Agents / Automation | Environment/bootstrap context. | Protected | Local operational metadata. |
| `/.codex/` | Agents / Automation | Local Codex metadata. | Protected | Tooling metadata, not product runtime. |
| `/releases/` | Archisynapse | Release receipts and checksum manifests. | Protected | Trust/provenance and release evidence. |
| `/deployment/` | Shared Infrastructure | Deploy scripts and infra definitions. | Protected | High-impact ops lane. |
| `/Dockerfile` | Shared Infrastructure | Top-level containerization. | Protected | Infra-critical. |
| `/Dockerfile.backend` | Shared Infrastructure | Backend image definition. | Protected | Infra-critical. |
| `/Dockerfile.frontend` | Shared Infrastructure | Frontend image definition. | Protected | Infra-critical. |
| `/cloudbuild.backend.yaml` | Shared Infrastructure | Backend CI/CD build config. | Protected | Infra-critical. |
| `/cloudbuild.frontend.yaml` | Shared Infrastructure | Frontend CI/CD build config. | Protected | Infra-critical. |
| `/railway.toml` | Shared Infrastructure | Railway deployment config. | Protected | Deployment evidence. |
| `/vercel.json` | Shared Infrastructure | Vercel deployment config. | Protected | Deployment evidence. |
| `/.next/` | Legacy / Needs Review | Generated Next.js build output. | Legacy / Needs Review | Build artifact, not architecture source of truth. |
| `/node_modules/` | Legacy / Needs Review | Installed dependencies. | Legacy / Needs Review | Dependency artifact, not architecture source of truth. |
| `/Empire-1/` | Legacy / Needs Review | Nested/parallel structure with unclear role. | Needs Review | Possible duplication or artifact; preserve and classify later. |
| `/empire-one-sla113/` | Legacy / Needs Review | Parallel SLA113-related structure. | Needs Review | Possible duplication risk. |
| `/docs/` | Shared Infrastructure | General documentation and infra notes. | Active | Useful, but not a single subsystem. |
| `/INFRASTRUCTURE_RECOMMENDATIONS.md` | Shared Infrastructure | Infra planning document. | Docs Only | Also currently untracked in the dirty tree. |
| `/RESUME_NEXT_SESSION.md` | Agents / Automation | Session continuity note. | Docs Only | Operator continuity artifact. |
| `/GEMINI.md` | Shared Infrastructure | Model/tooling-related project notes. | Docs Only | Keep visible until classified deeper. |
| `/HYBRID_AI_STACK_PLAYBOOK.md` | Shared Infrastructure | Stack and AI integration guidance. | Docs Only | Architecture-adjacent playbook. |
| `/test_reports/` | Shared Infrastructure | Test evidence and reports. | Protected | Evidence store, not product surface. |
| `/tests/` | Shared Infrastructure | Test suite directory. | Active | Mixed test ownership. |
| `/test_result.md` | Shared Infrastructure | Test summary artifact. | Docs Only | Evidence file. |
| `/session-ses_32ab.md`, `/session-ses_3515.md`, `/session-ses_364c.md` | Agents / Automation | Session history artifacts. | Docs Only | Operational memory/evidence. |

## Protected Areas

- `README.md`, `ARCHITECTURE.md`, `ADRS/`, `DEPLOY_MAP.md`, and `SHARED/` because they define universe identity, boundaries, and deployment logic.
- `SLA113/`, `policy.yaml`, and `middleware.ts` because they sit on parent-runtime and governance boundaries.
- `backend/app/core/`, `backend/app/data/`, `backend/app/routers/`, and `backend/app/services/` because they shape shared backend contracts across universes.
- `releases/` because release receipts, manifests, and provenance artifacts should not be casually altered.
- `deployment/`, `Dockerfile*`, `cloudbuild*.yaml`, `railway.toml`, and `vercel.json` because they affect live deployment topology.
- `omni_agent/state/`, `memory/`, `.agents/`, `.emergent/`, and test evidence folders because they hold operational memory, state, or audit artifacts.
- Brand assets under `public/brand/` and Southern-facing assets because they are cross-universe identity evidence.

## Legacy / Needs Review

- `.next/` and `node_modules/` are generated artifacts and should not be used as architecture sources.
- `sla113_clean/` appears to be a parallel or simplified SLA113 runtime and needs explicit status classification.
- `Empire-1/` and `empire-one-sla113/` are unclear parallel structures that may indicate duplication, history, or migration leftovers.
- `backend/archived/` contains preserved historical artifacts that should remain intact until intentionally reviewed.
- Disabled tests (`*.disabled`) and various top-level experimental scripts (`azure-*.js`, `gpt4o-test.js`, `test_*.py.disabled`) need classification before cleanup.
- `firekirin-engine/` and `external_projects/` strongly suggest Southern or adjacent experience lanes, but need deeper ownership confirmation.
- Existing dirty git changes in `.gitignore`, `backend/app/data/...`, `backend/server.py`, `next.config.mjs`, `INFRASTRUCTURE_RECOMMENDATIONS.md`, `backend/.gitignore`, and `docs/infra/` were present before this map and were left untouched.

## Recommended Next Step

Create a follow-up `EMPIRE1_OS_APP_CROSSCHECK.md` or equivalent boundary doc that cross-references:

1. `Empire-1` parent runtime/governance surfaces
2. `empire1-lyrica-ecosystem` Lyrica orchestration/architecture lane
3. `Lyrica3-pro` current app implementation lane
4. adjacent truth lanes such as `Archisynapse`, `Cultura`, `Southern`, and `Empire Auto Cofounder`

That next step should define adapters and protected ownership boundaries without collapsing universes together.
