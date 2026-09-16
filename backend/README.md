# ReliefNet Backend — Experiment 4

REST API for ReliefNet, built with Express and MongoDB (via Mongoose).

## Setup

```bash
npm install
cp .env.example .env
# edit .env — set MONGODB_URI to a local mongod or a MongoDB Atlas cluster
npm run dev
```

Requires a running MongoDB instance. Either:
- **Local:** install MongoDB Community Server and run `mongod`, then use `mongodb://127.0.0.1:27017/reliefnet`
- **Atlas (no local install needed):** create a free cluster at mongodb.com/atlas and paste its connection string into `.env`

Once running: `GET http://localhost:5000/api/health` should return `{"status":"ok"}`.

## Seeding the database

```bash
npm run seed
```

This **wipes** the Users, BloodRequests, and Donations collections and inserts realistic synthetic data: 8 donors (varied blood groups/areas, one marked unavailable), 4 requesters (including two hospital blood banks), 7 blood requests across all urgency levels, and 2 completed donations that mark their requests fulfilled. Every seeded account's password is `password123`. Only run this against a database you're OK with being cleared.

## Connecting to MongoDB Atlas specifically

1. In Atlas, go to **Network Access** and add your current IP (or `0.0.0.0/0` while developing) — Atlas blocks all connections by default until an IP is allow-listed.
2. Copy the connection string from **Database → Connect → Drivers**. It usually ends in a bare `/` — **add a database name** right after the host, e.g. `.../reliefnet?retryWrites=true&w=majority`. Without it, Mongoose silently uses a database called `test`.
3. Never commit `.env` or share your connection string anywhere — it contains your database password in plain text. If a real password is ever pasted somewhere it shouldn't be, rotate it immediately in Atlas → Database Access.

## Models

- **User** — donor / requester / admin, with donor-only fields (bloodGroup, area, isAvailable)
- **BloodRequest** — an emergency request posted by a requester
- **Donation** — a donor fulfilling a request

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Register as donor or requester |
| POST | `/api/users/login` | Log in |
| GET | `/api/users/donors?bloodGroup=&available=` | List donors, filterable |
| GET | `/api/users/:id` | Get a single user |
| GET | `/api/requests?bloodGroup=&urgency=&status=&requesterId=` | List requests, filterable |
| GET | `/api/requests/:id` | Get a single request |
| POST | `/api/requests` | Create a new emergency request |
| PATCH | `/api/requests/:id` | Update a request (e.g. status) |
| DELETE | `/api/requests/:id` | Delete a request |
| GET | `/api/donations?donorId=` | List donations |
| POST | `/api/donations` | Record a donation (marks the request fulfilled) |
| GET | `/api/stats` | Platform-wide counts for the admin panel |

All input is validated with `express-validator`; invalid requests return `400` with a list of field errors. See `src/middleware/errorHandler.js` for how DB and validation errors are turned into consistent JSON responses.

## What's next
- Experiment 5 adds security hardening (Helmet, rate limiting, sanitization).
- Experiment 6 adds real password hashing and JWT-based login (replacing the plaintext password check currently in `userController.js`).
- Experiment 7 is this same API tested via a Postman collection.
