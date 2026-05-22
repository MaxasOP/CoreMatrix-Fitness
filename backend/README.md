# CoreMatrix MERN Backend

This folder contains a minimal Express + Mongoose backend intended as a migration target from the legacy MySQL/AngularJS app.

Quick start:

```bash
cd backend
npm install
cp .env.example .env
# edit .env to set MONGO_URI and JWT_SECRET if needed
npm run dev
```

API endpoints mirror the original app under `/api` (see routes).

Migration from MySQL:

1. Ensure your MySQL server is running and the legacy `corematrix_db` database is available.
2. Configure MySQL connection values in `backend/.env` (or environment variables): `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`.
3. Configure `MONGO_URI` in `backend/.env`.
4. Run the migration from the `backend` folder:

```bash
npm run migrate
```

This will import users, workouts, and meals from MySQL into MongoDB. Existing users (by email) are skipped to avoid duplicates.
