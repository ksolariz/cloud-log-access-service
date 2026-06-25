# Cloud Log Access — Frontend

React + Material UI frontend for the Cloud Log Access Service challenge.
Built to pair with your existing FastAPI backend (JWT auth, Redis sessions,
`require_role` RBAC, S3/LocalStack-backed `/logs` endpoints).

## Stack

- **React 18** + **Vite** — fast dev server, no CRA baggage
- **Material UI v5** — same as requested in your stack
- **Zustand** (`persist` middleware) — centralized, persisted session state
- **axios** — API client with interceptors for auth + 401 handling
- **react-router-dom v6** — routing + protected/role-guarded routes

## Project structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.js       # axios instance, attaches JWT, handles 401
│   │   ├── authApi.js      # login / logout
│   │   └── logsApi.js      # list / download / presign
│   ├── store/
│   │   └── authStore.js    # zustand store: token, role, expiry, persisted
│   ├── components/
│   │   ├── ProtectedRoute.jsx  # auth + role guard
│   │   └── Navbar.jsx          # session info + live expiry countdown
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── LogsPage.jsx        # list, download, presign dialog (bonus)
│   │   └── ForbiddenPage.jsx   # shown when role check fails
│   ├── theme.js             # MUI dark theme + design tokens
│   ├── App.jsx               # routes
│   └── main.jsx
├── Dockerfile               # dev (Vite) + prod (nginx) targets
├── nginx.conf
├── docker-compose.snippet.yml  # merge into your existing compose file
└── .env.example
```

## Running it

### Option A — plug into your existing `docker-compose.yml`

Copy the `frontend` service from `docker-compose.snippet.yml` into your
existing compose file (the one that already has `backend`, `redis`,
`localstack`), then:

```bash
docker compose up --build
```

Frontend: http://localhost:5173 — it proxies `/api/*` to the backend
container automatically (see `vite.config.js`), so there's no CORS setup
needed in dev.

### Option B — run standalone against a backend on localhost:8000

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## ⚠️ Important: confirm the API contract matches your backend

I don't have access to your actual FastAPI route signatures, so I built
this against the **most common shape** for the spec you described. The
three files below are the *only* places that assume a specific
request/response shape — check them against your real endpoints first:

| File | Assumed endpoint | Assumed request | Assumed response |
|---|---|---|---|
| `api/authApi.js` | `POST /auth/login` | JSON `{username, password}` | `{access_token, token_type}` |
| `api/authApi.js` | `POST /auth/logout` | — (token in header) | 204 |
| `api/logsApi.js` | `GET /logs` | — | `[{filename, size, last_modified}]` |
| `api/logsApi.js` | `GET /logs/{filename}` | — | binary file |
| `api/logsApi.js` | `POST /logs/{filename}/presign` | `{expires_in}` | `{url, expires_in}` |

Also check `authStore.js`'s `decodeJwt()` — it expects your JWT payload to
have a `role` (or `roles[0]`) and `sub`/`username` claim, since the role
chip, RBAC route guard, and expiry countdown all read straight off the
token rather than calling a separate `/me` endpoint. If your token doesn't
carry the role, the simplest fix is to add it as a claim when you sign the
JWT — otherwise the frontend has no way to know it without an extra call.

If your `/auth/login` uses `OAuth2PasswordRequestForm` (form-encoded, the
FastAPI tutorial default) instead of JSON, swap the body in `authApi.login`
to a `URLSearchParams` instance.

## Design decisions

- **Zustand over Redux**: the brief asks for "a centralized global state
  solution to sync and persist the user session" — Zustand's `persist`
  middleware does exactly that in ~40 lines, with no boilerplate.
- **Role read from the JWT, not a separate endpoint**: keeps the session
  self-contained — `ProtectedRoute` can synchronously check role on render
  instead of waiting on a network round-trip.
- **401 → auto-logout in the axios interceptor**: a revoked Redis session
  on the backend (your logout/revocation feature) is reflected immediately
  on the frontend on the next API call, not just on a manual logout click.
- **Live expiry countdown in the navbar**: makes the JWT's `exp` claim and
  the backend's Redis session lifetime visible to the user, instead of a
  silent timeout that surprises them mid-task.
- **Blob download via `responseType: "blob"`**: lets the browser handle the
  "Save As" natively without the file ever needing to round-trip through a
  base64 string.

## What I'd add with more time

- A `/me` or token-refresh endpoint instead of trusting the JWT exp purely
  client-side (the backend should still be the source of truth on logout).
- `react-query` for caching/retry on the logs list instead of a manual
  `useEffect` fetch.
- Cypress/Playwright smoke test for the login → list → download flow, to
  pair with whatever pytest suite you have on the backend.
