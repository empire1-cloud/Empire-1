# AGENTS.md

## Cursor Cloud specific instructions

### Architecture Overview

This is the **Empire Universe** codebase — a multi-tenant SaaS platform with a Hybrid Intelligence Core (19 AI engines). It has three runnable services:

| Service | Directory | Port | Command |
|---------|-----------|------|---------|
| FastAPI Backend | `backend/` | 8001 | `source backend/.venv/bin/activate && cd backend && uvicorn server:app --reload --port 8001` |
| CRA Frontend (Dashboard) | `frontend/` | 3001 | `cd frontend && DISABLE_ESLINT_PLUGIN=true BROWSER=none yarn start` |
| Next.js Root App | `/` (root) | 3000 | `npm run dev` |

### Key Dev Environment Notes

- **Backend runs in degraded mode without MongoDB.** The server starts successfully without a MongoDB connection. Set `MONGO_URL` and `DB_NAME` env vars for full database functionality.
- **CRA frontend requires `DISABLE_ESLINT_PLUGIN=true`** when starting in dev mode. The root `.eslintrc.json` extends `next/core-web-vitals` which conflicts with the CRA ESLint config inherited via the parent directory. This env var is the standard CRA mechanism to bypass webpack eslint-plugin.
- **Next.js dev server**: Clear `.next/` cache (`rm -rf .next`) if you see `__webpack_modules__[moduleId] is not a function` errors after dependency changes.
- **Backend venv**: Python dependencies are installed in `backend/.venv`. Always activate with `source backend/.venv/bin/activate` before running backend commands.
- **Backend tests** use `pytest` and hit the live server (not mocked). Set `REACT_APP_BACKEND_URL=http://localhost:8001` before running: `pytest backend/tests/ -v`.
- **3 pre-existing test failures** in `test_engine_endpoints.py`: engine count assertion (expects 18, server returns 19) and 2 pipeline endpoints return 401 (require auth tokens the tests don't provide).
- **Next.js build fails** due to a pre-existing lint error in `AztecFishGame.tsx` (`react/jsx-no-comment-textnodes`). Dev mode (`npm run dev`) works fine.
- **Root lint**: `npx next lint` (requires `eslint-config-next@14.2.3` installed as devDependency).
- **Native dependencies** for the `canvas` npm package: `libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev pkg-config`.

### Environment Variables (Backend)

The backend reads from `backend/.env` or environment variables. Key vars:
- `MONGO_URL` / `MONGODB_ATLAS_EMPIRE_URI` — MongoDB connection string
- `DB_NAME` / `MONGODB_ATLAS_EMPIRE_DB` — MongoDB database name
- `SECRET_KEY` — JWT signing key (use any string for local dev)
- `EMERGENT_LLM_KEY`, `OPENAI_API_KEY` — For AI engine invocations (optional; engines return errors without them but server runs)
