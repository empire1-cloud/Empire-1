# gstack-adapter

Read-only bridge between **gstack** project intelligence (`~/.gstack/projects/*`)
and the **Empire Cofounder Control Plane**. Replaces the Control Plane's
"READ-ONLY DEMO FALLBACK / local seed state" with real evidence from the
machine gstack runs on.

```
GSTACK (~/.gstack/projects/*)
        │
        ▼
GSTACK ADAPTER — READ ONLY          this service
        │
        ▼
EMPIRE COFOUNDER CONTROL PLANE      Vite app on :5173
```

## Run

```bash
cd gstack-adapter
pip install -r requirements.txt
uvicorn adapter.api:app --port 8787
```

Then point the Control Plane at `http://127.0.0.1:8787`.

## Endpoints (all GET, no writes)

| Endpoint | Feeds |
| --- | --- |
| `/api/gstack/health` | Live/offline status dot |
| `/api/gstack/projects` | Node context selector |
| `/api/gstack/activity` | Live agent activity (timeline events) |
| `/api/gstack/missions` | Missions derived from started/completed pairs |
| `/api/gstack/learnings` | Canon + Memory |
| `/api/gstack/artifacts` | CEO plans, designs, retros, checkpoints |
| `/api/gstack/evidence` | Review findings + QA receipts |
| `/api/gstack/artifacts/{project}/{artifact_id}/content` | Single artifact body (text, redacted, capped) |
| `/api/gstack/snapshot` | Everything above in one call |
| `/api/gstack/stream` | Server-Sent Events; emits on any timeline change |

Query params: `?project=<slug>` filters everywhere; `?limit=N` on list endpoints.

## The Empire rule — receipts are not verification

A completed gstack run moves a mission to `RECEIPTED`, **never** to
`VERIFIED`. Verification requires independent proof (CI run, reproduced
check, metric) and stays with the Cofounder's Engine 07. The adapter
reports `verification: "pending"` on every receipted mission by design.

## Safety boundary (v1, locked)

- **YES**: `timeline.jsonl`, `learnings.jsonl`, plans, reviews, QA
  receipts, checkpoints, retros, designs, `decisions.active.json`.
- **NO**: full Claude/Codex transcripts (`~/.gstack/transcripts/` is
  denylisted), anything under `~/.claude/`, secrets. Text content is
  passed through a secret redactor (API keys, bearer tokens, connection
  strings) before it is served.
- Strictly read-only: files are opened read-only, no mutating routes
  exist, and every resolved path must stay inside
  `~/.gstack/projects/` (symlink-escape checked).
- Binds to 127.0.0.1 by default; CORS allows only the local Control
  Plane origins (`:5173`).

## Config

| Env var | Default | Purpose |
| --- | --- | --- |
| `GSTACK_HOME` | `~/.gstack` | Same variable gstack itself honors |
| `GSTACK_ADAPTER_CORS` | `http://127.0.0.1:5173,http://localhost:5173` | Extra origins, comma-separated |

## Tests

```bash
cd gstack-adapter && python3 -m pytest tests/ -q
```
