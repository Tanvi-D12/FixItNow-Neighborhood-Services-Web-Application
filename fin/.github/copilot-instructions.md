## Quick orientation for AI coding agents

This repository is a full-stack Spring Boot + React app (backend in `backend/`, frontend in `frontend/`). Below are the minimal, high-value facts and examples that help an AI agent be productive immediately.

- Architecture: Spring Boot 3 backend exposing REST endpoints and STOMP WebSocket at `/ws`; React frontend (CRA) calling the API under `REACT_APP_API_URL`.
  - Backend entry: `backend/src/main/java/com/fixitnow/FixItNowApplication.java`
  - Security: `backend/src/main/java/com/fixitnow/config/WebSecurityConfig.java` — JWT auth, CORS via `app.cors.allowed-origins` and publicly allowed paths (e.g. `/auth/**`, `/services/**`, `/services/map/**`).
  - WebSockets/STOMP: `backend/src/main/java/com/fixitnow/config/WebSocketConfig.java` registers `/ws` and uses `/app` and `/topic`, `/queue` prefixes.

- Frontend: React app under `frontend/`.
  - App entry: `frontend/src/index.js` and `frontend/src/App.js`.
  - Auth context: `frontend/src/contexts/AuthContext.js` — stores `accessToken`, `refreshToken`, `user` in localStorage and sets Axios default `Authorization` header.
  - Google Maps integration: `frontend/src/services/googleMapsService.js` and `frontend/src/components/MapView.js`. Map pages use `REACT_APP_GOOGLE_MAPS_API_KEY` in `.env`.

- Important flows and endpoints (use these exact strings in edits, tests, or mocks):
  - Auth: `/auth/signin`, `/auth/signup`, `/auth/refresh`, `/auth/me` (see `AuthController.java`).
  - Map/service APIs: `/services`, `/services/map/**`, `/services/*/reviews` (public read access).
  - WebSocket endpoint: `/ws` (client uses SockJS/Stomp).

- Local dev / build commands (Windows/Powershell):
  - Backend: `cd backend; mvn clean install; mvn spring-boot:run` (default port 8080)
  - Frontend: `cd frontend; npm install; npm start` (default port 3000)
  - Repo-level helpers: see `setup.bat`, `start-dev.bat`, and `test-system.bat` in repo root (`fin/`) for convenience.

- Conventions & patterns specific to this repo:
  - JWT tokens are returned in `AuthController` responses; frontend expects `accessToken` and `refreshToken` keys and stores them in localStorage.
  - Map-related services rely on `latitude`/`longitude` fields on `Service` entities. See `MAPS_FEATURE_DOCUMENTATION.md` and SQL migrations in `backend/src/main/resources/db/migration/` (V3..V5).
  - CORS: allowed origins are driven by `app.cors.allowed-origins` in backend properties; prefer editing this value rather than adding ad-hoc CORS code.
  - Role checks: backend uses Role enum and method security (`@EnableMethodSecurity`). Respect existing `requestMatchers` in `WebSecurityConfig.java` when adding endpoints.

- Integration notes / gotchas:
  - Google Maps: tests and local runs require a valid `REACT_APP_GOOGLE_MAPS_API_KEY` in `frontend/.env` (MapView warns and falls back to list views if missing).
  - WebSockets: client uses SockJS + STOMP; when testing, mock STOMP frames or run backend to exercise `/ws` endpoint.
  - API base: frontend expects `REACT_APP_API_URL` (e.g. `http://localhost:8080/api`). Confirm this before changing client calls.

- Quick code examples to reference or reuse:
  - Set Authorization header in frontend: `api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`` (see `AuthContext.js`).
  - Initialize Google Maps loader: `new Loader({ apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, libraries: ['places','geometry'] })` (see `googleMapsService.js`).

- Where to look for tests / migrations / scripts:
  - Database migrations: `backend/src/main/resources/db/migration/` (Flyway SQL files V3..V5)
  - Build artifacts and compiled classes: `backend/target/` (useful when debugging classpath issues)
  - Frontend scripts: `frontend/package.json` scripts `start`, `build`, `test`.

If you want me to expand any section (explain error messages, add testing examples, or include a short checklist for common PRs), tell me which area to expand. Do you want an abbreviated or an expanded version of this file? 
