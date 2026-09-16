# ReliefNet — Experiments 3 & 4 (+ location matching & working Respond)

- `frontend/` — React app: UI, hooks, Redux Toolkit for shared state
- `backend/` — Express + MongoDB/Mongoose REST API, with a seed script

## Run order

1. **Backend first:**
   ```bash
   cd backend
   npm install
   cp .env.example .env      # set MONGODB_URI — see notes below for Atlas
   npm run seed               # populates the DB with realistic sample data
   npm run dev
   ```
   Confirm it's up: `http://localhost:5000/api/health`

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env      # VITE_API_URL, defaults to http://localhost:5000/api
   npm run dev
   ```

## Using MongoDB Atlas
1. Atlas → **Network Access** → add your current IP (or `0.0.0.0/0` while developing).
2. Atlas → **Database → Connect → Drivers** → copy the connection string, then **add a database name** right after the host: `.../reliefnet?retryWrites=true&w=majority`
3. Never share your real connection string anywhere — it contains your DB password. Rotate immediately in Atlas → Database Access if one is ever exposed.

## What's new in this delivery
- **Respond button on the Donor Dashboard now actually works** — creates a real Donation record, marks the request fulfilled, and fires a confirmation notification.
- **Real location-based matching** — donor location is saved to MongoDB (via a new `PATCH /api/users/:id`) once the browser grants it, and both `GET /api/requests` and `GET /api/users/donors` now accept `lat`/`lng`/`radiusKm` and return results sorted by real distance (shown as "X km away" on the Donor Dashboard).
- **Real nearby-donor count on request creation** — `POST /api/requests` now returns `nearbyDonorsMatched`, computed server-side against actual coordinates at that moment, shown on the "Request posted" success screen.
- **Known limitation:** this count/match is computed once, at that moment — it is not pushed live to other donors' open screens. True cross-user real-time alerts need a persistent connection (Socket.io), which is Experiment 8.

## Seed data
`npm run seed` (inside `backend/`) wipes and repopulates Users, BloodRequests, and Donations. All seeded accounts use the password `password123`. Seeded users don't have a saved `location` yet — that gets filled in automatically the first time each donor logs in and grants location permission.
