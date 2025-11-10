<!--
High-value, repo-specific instructions for AI coding agents.
Keep this short (20-50 lines). Prefer concrete file paths, commands, and examples.
-->

# Copilot instructions (project-specific)

- Big picture: This is a full-stack Spring Boot + React application. The backend lives under `fin/backend/` and the React frontend under `fin/frontend/`.

- Key components:
  - Backend (Spring Boot, Java 17): `fin/backend/src/main/java/com/fixitnow/` — look for `AuthController`, `WebSecurityConfig`, and `WebSocketConfig` for auth, CORS and STOMP setup.
  - Frontend (Create React App + Tailwind): `fin/frontend/src/` — app entry `App.js`, auth context `contexts/AuthContext.js`, maps in `services/googleMapsService.js` and `components/MapView.js`.

- Local dev commands (Windows PowerShell):
  - Backend: `cd fin/backend; mvn clean install; mvn spring-boot:run` (runs on :8080 by default)
  - Frontend: `cd fin/frontend; npm install; npm start` (runs on :3000)
  - Production build: `cd fin/frontend; npm run build` then build backend jar with Maven.

- Important env/config keys used by the client and server:
  - Frontend expects `REACT_APP_API_URL` (e.g. `http://localhost:8080/api`).
  - Google Maps key: `REACT_APP_GOOGLE_MAPS_API_KEY` (frontend loader in `googleMapsService.js`).
  - Backend properties in `fin/backend/src/main/resources/application.properties` (DB, `app.jwt.secret`, `app.cors.allowed-origins`).

- Critical API & integration points (use these exact strings when searching or mocking):
  - Auth endpoints: `/auth/signin`, `/auth/signup`, `/auth/refresh`, `/auth/me` (see `AuthController`).
  - Public service endpoints: `/services`, `/services/map/**`, `/services/:id/reviews`.
  - WebSocket endpoint: `/ws` (STOMP/SockJS client in frontend).

- Project conventions/behaviour to preserve in edits/tests:
  - JWT tokens: frontend stores `accessToken`/`refreshToken` in localStorage and sets `Authorization: Bearer <token>` on Axios (`AuthContext.js`).
  - Provider registration requires a business document; backend blocks login for unverified providers (403 with a specific message). See `Register.js` and `AuthController` behavior in `Guide/IMPLEMENTATION_SUMMARY.md`.
  - DB migrations live at `fin/backend/src/main/resources/db/migration/` (Flyway SQL files). Prefer adding migrations rather than ad-hoc schema changes.

- Quick examples to reuse:
  - Set Authorization header in frontend API instance: `api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;` (see `services/api.js`).
  - Initialize Google Maps loader: `new Loader({ apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, libraries: ['places','geometry'] })`.

- Where to look next:
  - High-level docs: `README.md` and `Guide/COMPLETE_SYSTEM_GUIDE.md`, `Guide/IMPLEMENTATION_SUMMARY.md` contain feature-level notes and test flows.
  - Existing agent guidance: `fin/.github/copilot-instructions.md` (merge or consult before overwriting).

- If you modify backend endpoints, update frontend calls under `fin/frontend/src/services/` and adjust `REACT_APP_API_URL` in docs or `.env` if needed.

Please review this file and tell me if you want a shorter checklist-style version, or if you'd like me to merge additional content from `fin/.github/copilot-instructions.md` into this file.
