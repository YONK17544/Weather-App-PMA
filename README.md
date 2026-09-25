# Skyline — Full-Stack Weather App

A full-stack weather lookup and tracking app built as a technical assessment.
Users can search weather by city, zip code, GPS coordinates, or their current
location; save and manage weather records for custom date ranges (CRUD); and
export saved data in multiple formats.

## Tech Stack

- **Frontend:** React (Vite) — no Python/Java frameworks
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose)
- **Weather data:** [Open-Meteo](https://open-meteo.com/) — free, no API key required, supports both forecast and historical date ranges
- **Extras:** Google Maps (link + embed, no key required), YouTube Data API v3 (optional key, graceful fallback if not provided)

## Features

**Frontend**
- Location entry by city/town, zip code, GPS coordinates, or landmark
- "Use my location" via browser geolocation
- Current conditions (temperature, feels-like, humidity, wind, precipitation) with icons
- 5-day forecast
- Graceful error handling (invalid location, failed requests, denied location permission)
- Responsive layout
- Real, live API data — nothing static

**Backend**
- Full CRUD on saved weather records (create, read, update, delete), each covering a location + custom date range
- Server-side validation for date ranges and location existence (fuzzy-matched geocoding)
- RESTful API design
- MongoDB persistence via Mongoose
- Additional API integration: Google Maps + YouTube video results for the searched location
- Data export in JSON, XML, CSV, Markdown, and PDF formats

## Prerequisites

- [Node.js](https://nodejs.org) v18 or later (includes npm)
- A MongoDB database — either a local `mongod` instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## Requirements / Dependencies

See [REQUIREMENTS.md](./REQUIREMENTS.md) for the full list of libraries/packages
used and what each one does. Running `npm install` in `client/` and `server/`
installs everything automatically — see Setup below.

## Setup Instructions

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and set your MongoDB connection string:

```
MONGODB_URI=your_connection_string_here
PORT=5000
YOUTUBE_API_KEY=            # optional — leave blank for fallback search links
CLIENT_ORIGIN=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

You should see `[db] connected -> ...` and `Server listening on http://localhost:5000`.

### 3. Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. The dev server proxies
`/api/*` requests to the backend on port 5000.

## Project Structure

```
├── client/          React + Vite frontend
│   └── src/
│       ├── components/    UI components (search, current weather, forecast, records)
│       └── api.js         Fetch wrapper for backend calls
└── server/          Express + MongoDB backend
    ├── config/         Database connection
    ├── models/         Mongoose schemas
    ├── routes/         Express route handlers
    └── services/       Geocoding, weather-fetching, and export logic
```

## API Reference

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/weather?location=<text>` | Current + 5-day forecast for a place name/zip/coords |
| GET | `/api/weather?lat=&lon=` | Same, from raw coordinates |
| POST | `/api/records` | Create a saved record — `{ location, startDate, endDate, notes? }` |
| GET | `/api/records` | List all saved records |
| GET | `/api/records/:id` | Get one record |
| PUT | `/api/records/:id` | Update a record's notes/date range |
| DELETE | `/api/records/:id` | Delete a record |
| GET | `/api/records/export/all?format=json\|xml\|csv\|markdown\|pdf` | Export all records |

## Notes on design decisions

- Location resolution auto-detects input type (coordinates, US zip, or place
  name) and validates/fuzzy-matches it against a real geocoding service.
- Editing a saved record only allows changing the date range and notes, not
  the original location — keeps each record's history meaningful.
- Weather data comes from the same provider for both the live lookup and the
  CRUD date-range feature, satisfying the "no static data" requirement
  throughout. throughout.
