# Skyline — Weather App (Full-Stack Technical Assessment)

A full-stack weather lookup app built for the take-home assessment: React
(Vite) frontend, Express + MongoDB backend, CRUD persistence, extra API
integration, and multi-format data export.

## What it covers

**Tech Assessment 1 (Frontend)**
- Location entry by city/town name, US zip code, GPS coordinates, or "use my
  location" (browser geolocation) — resolved by the backend.
- Current conditions with temperature, feels-like, humidity, wind, and
  precipitation, plus a 5-day forecast strip.
- Responsive layout (grid collapses to a single column under 640px) and
  graceful error states (bad location, provider errors, geolocation denied).
- Built with React + Vite (no Python/Java frameworks).

**Tech Assessment 2 (Backend)**
- Full CRUD on saved weather records (`/api/records`), each covering a
  location + date range, with server-side date-range and location
  validation (fuzzy geocoding match — see `services/geoService.js`).
- RESTful API design; MongoDB via Mongoose for persistence.
- 2.2 API Integration: Google Maps (embed + link, no API key required) and
  YouTube (real search results if `YOUTUBE_API_KEY` is set, otherwise a
  graceful fallback search link — no hard dependency on a paid key).
- 2.3 Data Export: `/api/records/export/all?format=` supports `json`, `xml`,
  `csv`, `markdown`, and `pdf`.

Weather data comes from [Open-Meteo](https://open-meteo.com/) (no API key
needed, supports both forecast and historical date ranges, which is what
makes the CRUD date-range feature work for past *and* upcoming dates).

## Project structure

```
weather-app/
├── client/          React + Vite frontend
└── server/          Express + MongoDB backend
```

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # then edit MONGODB_URI if needed
npm run dev             # http://localhost:5000
```

You need a MongoDB instance — either local (`mongod` running on
`localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas)
cluster (paste its connection string into `MONGODB_URI`).

`YOUTUBE_API_KEY` in `.env` is optional. Without it, the YouTube panel
falls back to a plain search link instead of an API-backed result list.

### 2. Frontend

```bash
cd client
npm install
npm run dev              # http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so run the
backend first (or alongside).

## API quick reference

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/weather?location=<text>` | Current + 5-day forecast for a place name/zip/coords |
| GET | `/api/weather?lat=&lon=` | Same, from raw coordinates |
| POST | `/api/records` | Create — `{ location, startDate, endDate, notes? }` |
| GET | `/api/records` | Read — list all saved records |
| GET | `/api/records/:id` | Read — one record |
| PUT | `/api/records/:id` | Update — `{ notes?, startDate?, endDate? }` |
| DELETE | `/api/records/:id` | Delete a record |
| GET | `/api/records/export/all?format=json\|xml\|csv\|markdown\|pdf` | Export all records |

## Notes on design decisions

- **Location resolution** (`server/services/geoService.js`) auto-detects the
  input shape: `lat,lon` pairs are used directly, 5-digit strings are tried
  against a US zip geocoder, and everything else goes through Open-Meteo's
  fuzzy-matching place search. This satisfies the "validate the location
  really exists (or fuzzy match)" requirement without forcing the user to
  pick a format up front.
- **Editing a record** only allows changing the date range and notes, not
  the location — re-editing the location would really be a new lookup, and
  keeping it fixed keeps a record's history meaningful.
- Both the current/forecast lookup and the CRUD create/update paths hit the
  same Open-Meteo-backed weather service, so the assessment's "no static
  data" requirement holds throughout.
