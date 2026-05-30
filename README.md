

# CoreMatrix Fitness App

CoreMatrix is a personalized workout & nutrition tracker that works on modern MERN (MongoDB, Express, React, Node.js) architecture. This README explains what the app is, how the project is organized, and how to run, deploy, and troubleshoot it. 
--

Contents
- Overview
- Tech stack
- Project structure (what's in each folder)
- What you were stuck on (summary of problems and fixes)
- How to run locally (backend + frontend)
- Environment variables and production notes
- Deployments (Render for backend, Vercel for frontend, Docker/GHCR)
- API reference
- Troubleshooting (common issues & how they were resolved)
- Next steps

--

Overview
--------
CoreMatrix lets users register, log workouts and meals, view daily/weekly summaries, and track long-term progress. Every user has their own private data — workouts and meals are scoped to the signed-in account.


- A Node/Express API using Mongoose to talk to MongoDB (hosted on Atlas for production).
- A React single-page app (Create React App) for a modern, responsive, mobile-first UI.
- Docker + CI automation for building and optionally publishing container images.

Tech stack (short)
-------------------
- Frontend: React (Create React App), React Router, Tailwind used via CDN for fast design.
- Backend: Node.js + Express, Mongoose (MongoDB ODM), JWT auth, Helmet for security.
- Database: MongoDB Atlas (production) or local Mongo for development.
- Deployment: Frontend on Vercel (static React build), Backend on Render (container), optional Docker image built and pushed to GitHub Container Registry (GHCR).

Project structure
------------------
- `backend/` — Express API, Mongoose models, controllers, routes, middleware, and backend configuration. Key files:
    - `backend/server.js` — app entrypoint, connects to MongoDB, registers routes, serves client build when present.
    - `backend/controllers/authController.js` — register/login handlers and profile calculations.
    - `backend/controllers/fitnessController.js` — CRUD for workouts & meals and a daily tip endpoint.
    - `backend/models/` — `User.js`, `Workout.js`, `Meal.js` (Mongoose schemas).
    - `backend/middleware/authMiddleware.js` — optional JWT middleware used to identify the requesting user.

- `client/` — React app (Create React App). Key files:
    - `client/src/index.js` — app bootstrap and global styles import.
    - `client/src/App.js` — routes and page wiring.
    - `client/src/components/` — `Home.js`, `Auth.js`, `Forge.js`, `Fuel.js`, `Progress.js`, `Logs.js`, and a shared `Layout.js`.
    - `client/src/api.js` — axios wrapper used to contact the backend.
    - `client/public/index.html` — includes Tailwind CDN and Inter font for the new UI.
    - `client/src/styles.css` — custom theme and helpers (glass, safe-area, cards).

- Root CI / Deployment files:
    - `Dockerfile` — multi-stage build that builds the React app then packages it into the backend image.
    - `.github/workflows/docker-publish.yml` — builds and pushes image to GHCR (if enabled).

How to run locally (developer quick-start)
----------------------------------------
Prerequisites: Node 16+, npm, and a MongoDB instance (local or Atlas). Docker is optional.

1. Install dependencies (run in both `backend/` and `client/` if you prefer separate installs):

```bash
# from repository root (runs both client and backend installs if package.json scripts set up), or:
cd client && npm install
cd ../backend && npm install
```

2. Configure local environment (development):

Create `backend/.env` with at least:

```
MONGO_URI=mongodb://localhost:27017/corematrix
JWT_SECRET=change_this_to_a_secure_value
PORT=4000
```

3. Run backend (development):

```bash
cd backend
npm run dev   # or `node server.js` depending on scripts
```

4. Run client (development):

```bash
cd client
npm start
```

Open `http://localhost:3000` (CRA default) or the port shown by `npm start` for the client. The client uses `REACT_APP_API_URL` to find the backend; set it locally if needed (e.g., `http://localhost:4000/api`).

Production-style local build (single container):

```bash
docker build -t corematrix:local .
docker run --rm -p 4000:4000 --env-file backend/.env corematrix:local
```

Environment variables (production checklist)
-----------------------------------------
- `MONGO_URI` — MongoDB connection string (Atlas recommended in production).
- `JWT_SECRET` — secure random secret for signing JWTs.
- `PORT` — optional.

Make sure Render (backend) and Vercel (frontend) have the correct env vars configured:
- On Vercel set `REACT_APP_API_URL` to `https://corematrix-fitness.onrender.com/api` (or your backend URL).
- On Render set `MONGO_URI` and `JWT_SECRET` in the service's environment.

Deployment notes
----------------
- Backend: currently deployed on Render as a container (`https://corematrix-fitness.onrender.com`). Render must have `MONGO_URI` and `JWT_SECRET` set in its environment.
- Frontend: deployed on Vercel (root set to `client/`). Ensure `REACT_APP_API_URL` is configured in Vercel's Environment Variables and that the project is redeployed after changes.
- Optional: GitHub Actions workflow builds a Docker image and can push to GHCR (permissions must be set to allow `packages: write`).

API reference (high-level)
--------------------------
- `GET /api/health` — returns { status: 'ok' } for health checks.
- `POST /api/auth/register` — create an account; response includes `token`.
- `POST /api/auth/login` — login; response includes `token`.
- `GET /api/workouts` — returns workouts for the authenticated user (empty array for anonymous requests).
- `POST /api/workouts` — create a workout (authenticated).
- `PUT /api/workouts/:id` — update a workout (authenticated).
- `DELETE /api/workouts/:id` — delete a workout (authenticated).
- `GET /api/meals` — returns meals for the authenticated user (empty array for anonymous requests).
- `POST /api/meals` — create a meal (authenticated).
- `GET /api/tip` — get a daily nutrition tip (public).

Troubleshooting — common issues & quick fixes
--------------------------------------------
- Blank frontend or dashboard not loading:
    - Ensure `REACT_APP_API_URL` on Vercel points to the backend API (e.g. `https://corematrix-fitness.onrender.com/api`).
    - Check browser console for CORS or 405/500 errors.

- Registration / login failing (405/401):
    - Confirm backend URL set in `client/src/api.js` (via `REACT_APP_API_URL`) and that the backend is reachable.
    - Inspect backend logs (Render) for stack traces.

- Seeing other users' data while not signed in:
    - Update: backend now returns `[]` on anonymous list requests; redeploy backend to apply the fix.

- 500 errors from backend during reads:
    - Often caused by invalid `userId` conversions. We added defensive ObjectId handling and JWT coercion.
    - Check `backend` logs for exact error messages; confirm `JWT_SECRET` matches the secret used to sign tokens.

- Docker build errors on Render (chown issues):
    - Ensure Dockerfile creates and uses non-root user properly; recent Dockerfile patches addressed chown/create user ordering.

Where you can look in the code (quick links)
-------------------------------------------
- API entrypoint: [backend/server.js](backend/server.js)
- Auth logic: [backend/controllers/authController.js](backend/controllers/authController.js)
- Fitness controllers: [backend/controllers/fitnessController.js](backend/controllers/fitnessController.js)
- Client entry: [client/src/index.js](client/src/index.js)
- Client API wrapper: [client/src/api.js](client/src/api.js)
- Main layout and styles: [client/src/components/Layout.js](client/src/components/Layout.js), [client/src/styles.css](client/src/styles.css)

Next steps and recommendations
------------------------------
1. Redeploy backend on Render after any backend code changes so the anonymous-data fix and ObjectId handling are active in production.
2. Redeploy Vercel after any client changes and ensure `REACT_APP_API_URL` is set.
3. Optional: replace Tailwind CDN with a proper build integration (recommended for production performance) and include generated CSS in the build.
4. Optional: add automated integration tests that exercise register/login and authenticated API calls to prevent regressions.



