# Requirements

This project uses Node.js/npm, so dependencies are normally installed via
`npm install` (which reads `package.json` in each folder). This file lists
everything that gets installed, for reviewers who want a quick reference
without opening `package.json` directly.

## System Requirements

- Node.js v18 or later (includes npm)
- A MongoDB database — local `mongod` instance or a free MongoDB Atlas cluster

## Backend (`server/`)

Install with:
```bash
cd server
npm install
```

| Package | Purpose |
|---|---|
| express | Web server / REST API framework |
| mongoose | MongoDB object modeling / connection |
| cors | Enables cross-origin requests from the frontend |
| dotenv | Loads environment variables from `.env` |
| js2xmlparser | Converts records to XML for export |
| pdfkit | Generates PDF exports |
| nodemon (dev only) | Auto-restarts the server on file changes |

## Frontend (`client/`)

Install with:
```bash
cd client
npm install
```

| Package | Purpose |
|---|---|
| react | UI library |
| react-dom | React rendering for the browser |
| vite | Dev server / build tool |
| @vitejs/plugin-react (dev only) | React support for Vite |

## Notes

- Exact pinned versions are locked in `package-lock.json` in each folder —
  running `npm install` reproduces the exact same dependency versions used
  during development.
- No API keys are required to run the core app. `YOUTUBE_API_KEY` in
  `server/.env` is optional — without it, the app falls back to a plain
  YouTube search link instead of live API results.
