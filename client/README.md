# CoreMatrix React Client

Quick start (from repository root):

```bash
cd client
npm install
npm start
```

The client proxies API requests to `http://localhost:4000` by default (`proxy` in package.json).

## Vercel Deployment

Deploy this app on Vercel with the project root set to `client/`.

Why:

- `client/package.json` is the app entry point for Vercel builds.
- `client/public/index.html` is the HTML entry file Vercel serves.
- `client/vercel.json` rewrites React Router routes back to `index.html`.

Backend note:

- Do not deploy the Express backend to Vercel.
- Keep the API on Render or another Node host, then point the client to that API URL.
- Set `REACT_APP_API_URL=https://corematrix-fitness.onrender.com/api` in the Vercel project environment variables.
