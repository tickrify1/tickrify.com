Tickrify: automated audit, deterministic signal API/UI, tests, and CI

Changed files:
- `backend/signal_utils.py`
- `backend/signal_api.py`
- `backend/main.py` (wire router, health shape)
- `frontend/src/components/SignalTab.tsx`
- `frontend/src/pages/Signals.tsx` (renders SignalTab)
- `tests/test_signal_api.py`, `tests/test_parser.py`, `tests/test_golden_signals.py`, `tests/golden_signals.json`
- `.github/workflows/ci.yml`
- `frontend/package.json`, `frontend/vite.config.ts`, `frontend/vitest.setup.ts`, `frontend/src/components/SignalTab.test.tsx`

Commands run and final status (truncated outputs):
```
git checkout -b fix/auto-audit-$(date +%F-%H%M)
git add -A && git commit -m "wip: snapshot before auto-audit" || true
npm ci (frontend) -> ok
pip install -r backend/requirements.txt -> ok
vite build (frontend) -> ok
uvicorn backend.main:app -> /api/signal -> 200 {"WAIT", 0.7}
pytest -q -> 5 passed
npm test (frontend) -> 1 passed
```

API standardization:
- Added GET `/api/signal` returning:
  - `signal`: BUY | SELL | WAIT
  - `confidence`: 0.0-1.0
  - `reason`: short explanation (<=200 chars)
  - `timestamp`: ISO8601 UTC
  - `model_version`: optional
- Added `/api/health` minimal: `{ ok: true, timestamp: ISO }` (alias preserved via existing endpoints).

Deterministic signal pipeline:
- Implemented `interpret_model_output()` with deterministic parsing and optional logits softmax mapping with WAIT fallback if <0.55.
- Production-friendly default temperature assumed via wrapper; current simple generator returns WAIT for reproducibility when no external model is configured.
- Added `MODEL_DEBUG_MODE` flag to write raw model outputs under `logs/model_debug/` for auditability.

Frontend UI:
- New `SignalTab` fetches `/api/signal` on mount and displays a badge and confidence.
- Integrated at top of `Signals` page so the tab opens showing the latest signal.

Tests added:
- Backend API: `tests/test_signal_api.py` validates schema and value ranges.
- Parser: `tests/test_parser.py` and golden dataset check text→signal mapping.
- Frontend: `SignalTab.test.tsx` ensures badge renders with mocked fetch.

CI:
- `.github/workflows/ci.yml` builds frontend, runs frontend tests, installs backend deps, lints (non-blocking), and runs pytest.

Environment variables required:
- `MODEL_API_KEY` (or `OPENAI_API_KEY` if using the existing integration), `EXCHANGE_API_KEY`, `EXCHANGE_SECRET`, `DATABASE_URL`, `SENTRY_DSN` (optional), `MODEL_DEBUG_MODE` (optional), `STRIPE_SECRET_KEY` (existing), `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_JWT_SECRET` (existing backend).
Set in Vercel or `.env`.

Deploy steps:
```
# Backend (Render/Fly/Heroku) example with uvicorn
pip install -r backend/requirements.txt
./venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8001

# Frontend (Vercel or static hosting)
npm ci
npm run build
# Serve dist/ via your platform or Vercel settings

# CI will validate on PR to main
```

Items not fully validated:
- External model providers and Stripe require real secrets; code fails gracefully and returns WAIT when unavailable.

Next recommended steps:
- Add latency and error metrics (Prometheus or Vercel logs) for `/api/signal` and model calls.
- Implement real model wrapper with temperature=0.0, strict JSON schema validation.
- Add backtest-based confidence calibration and report signal distribution dashboards.


