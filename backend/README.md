# CoreMatrix MERN Backend

This folder contains the Express + Mongoose backend for the MERN version of CoreMatrix.

Quick start:

```bash
cd backend
npm install
cp .env.example .env
# edit .env to set MONGO_URI and JWT_SECRET if needed
npm run dev
```

API endpoints mirror the original app under `/api` (see routes).

The old MySQL import path has been removed because you do not need legacy data. This backend now expects MongoDB Atlas as the source of truth for new data only.
