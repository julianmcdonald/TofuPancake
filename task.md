# Task: Prepare TofuPancake-TyperRacer for Render free-tier deployment

You are working in a fresh 'git clone' of an Express + Socket.io + React + Postgres app. Your job is to make exactly 4 changes so the app can deploy to Render's free tier as a single Node web service with a manager Postgres database. Do not make any other changes.

## Repo context (read these first to orient yourself)

- `backend/` - Node/Express + Socket.io, uses Babel to compile `src/` -> `dist/`, uses 'pg' for Postgres.
- `frontend/` - React (Create React App), built with react-scripts`. Needs `--legacy-peer-deps` because of old Material-UI v4.
- `backend/src/index.js` - already serves `path.join(__dirname, 'build')` and falls through to `index.html` when `NODE_ENV=production`, so a single Node process can host both the API and SPA.
- `backend/src/sockets/index.js` - `socket.io` server is bound to the same HTTP server.
- `frontend/src/sockets/index.js` - client calls `io()` with no args, so it connects to the same origin. No CORS config needed.
- `backend/src/db/bootstrap.js` - idempotently runs `schema.sql` and `seed.sql` on boot when the `prose` table is empty.
- `backend/src/db/pool.js` - reads `DATABASE_URL` env var; currently has no TLS handling.

Read `backend/src/index.js`, `backend/src/db/pool.js`, `backend/src/db/bootstrap.js`, and the root `package.json` before editing, so you know the baseline.

## Change 1 - Add SSL handling to `backend/src/db/pool.js`

Replace the entire file with:

```js
import pg from 'pg';

require('dotenv').config();

cost { Pool } = pg;

const connectString = process.env.DATABASE_URL || 'postgres://tofu:tofu@localhost:5432/tofu_pancake';

etc....
```

## Change 2 - Replace the root `package.json`

Some of the changes are
"engines": { "node": ">18 <=22"}

"scripts": {
    "build": "cd backend && npm ci && npm run build and cd ../frontend && npm ci --legacy-peer-deps && npm run build && rm -rf ../backend/dist/build && cp -R build ../backend/dist/build && cd.."
    "start": "cd backend && npm start"
}

...

Key things the build script should do
- `cd backend && npm ci && npm run build` -> produces `backend/dist/index.js` and friends via Babel.
- `cd ../frontend && ci --l..... produces frontend/build
- rm -rf ... puts the SPA where express expects it

## Change 3 Create `render.yaml` at the repo toot

```yaml

databases:
  - name: tofupancake-db
    plan: free
    databaseName: tofu_pancake
    user: tofu

services:
    - type: web
      name: tofupancake
      runtime: node
      plan: free
      region: <I dunno this one, whatever Melbourne is>
      branch: main
      buildCommand: npm run build
      startCommand: npm start
      healthCehckPath: /api/leaderboard
      envVars:
        - key: NODE_ENV
            value: production
        - key: NODE_VERSION
          value: 22
        - key: DATABASE_URL
          fromDatabase:
            name: tofupancake-db
            property: connectingString
```

## Change 4 - Update Readme.