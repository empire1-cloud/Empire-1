# AGENTS.md — Empire-1

This repo is part of the Empire1 ecosystem. See `~/projects/AGENTS.md` for full ecosystem context.

## Agent Skills (Engineering Workflow)

This project follows disciplined development workflows defined in `~/projects/agent-skills/skills/`. Key skills for this repo:

- `spec-driven-development` — Write PRD before coding
- `incremental-implementation` — Thin vertical slices, test first
- `api-and-interface-design` — Contract-first for all backend endpoints
- `security-and-hardening` — OWASP Top 10 for all auth/billing routes
- `code-review-and-quality` — Five-axis review for all PRs

## Key Paths

| Resource | Path |
|----------|------|
| Ecosystem source of truth | `~/projects/AGENTS.md` |
| Skills (23 engineering workflows) | `~/projects/agent-skills/skills/` |
| Skill agents/personas | `~/projects/agent-skills/agents/` |
| Agent memory (MCP) | `mempalace` — installed via `uv tool install mempalace` |
| Market research | `/last30days <topic>` — requires `npx skills add mvanhorn/last30days-skill -g` |
