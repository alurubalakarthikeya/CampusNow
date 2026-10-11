# CampusNow backend

FastAPI service that owns authentication, authorization and incident records
for the CampusNow mobile app. The mobile client never talks to ServiceNow, and
no privileged credential ever reaches the app.

```
backend/
├── app/
│   ├── main.py               app wiring: settings, middleware, routes
│   ├── core/
│   │   ├── config.py         settings, validated at startup
│   │   ├── security.py       identity boundary (JWT/JWKS, no bypass)
│   │   └── errors.py         one error envelope, no internal leakage
│   ├── db/session.py         engine, session dependency, ORM models
│   ├── schemas/report.py     request/response contracts (writable allowlist)
│   ├── repositories/         all SQLAlchemy access lives here
│   ├── services/             business rules: ownership, lifecycle, pulse
│   ├── integrations/         ServiceNow boundary (unconfigured)
│   └── api/v1/router.py      versioned routes
├── tests/                    pytest suite
├── requirements.txt
└── .env.example
```

## Commands

```bash
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
pytest -q
```

## Boundaries worth knowing

- **Routes** validate transport, then call a **service**. Status changes are
  not a client operation: `ReportService.transition` enforces the lifecycle
  table and is reached from the future ServiceNow integration or an internal
  tool, never from a student route.
- **Ownership** comes from the verified token subject, never from the request
  body. Another student's report answers 404 — the API does not confirm that
  it exists.
- **Writable fields** are an allowlist in `schemas/report.py`; unknown keys are
  rejected with 422, so `status`, `priority`, `assignment_group` and
  `servicenow_sys_id` cannot be set by a client.
- **Idempotency**: `Idempotency-Key` plus a unique `(student_id,
  idempotency_key)` constraint means a retried submission returns the existing
  report instead of opening a second incident.
- **Unconfigured means unavailable**, never simulated: authentication answers
  503 until the provider is set, and the ServiceNow adapter raises rather than
  inventing an incident.
- **Logs** carry request ids; credentials, tokens, request bodies and report
  contents are not logged.

## Deployment notes

- SQLite is development-only. A deployment sets `DATABASE_URL` to a managed
  database and applies migrations instead of `init_db()`.
- Serve over HTTPS; the API expects bearer tokens and should sit behind the
  campus network boundary.
- CORS allows no origins by default. Browser clients are not the target
  platform, and CORS is never authentication.
