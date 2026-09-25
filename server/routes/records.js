import { Router } from "express";
import WeatherRecord from "../models/WeatherRecord.js";
import { resolveLocation, LocationError } from "../services/geoService.js";
import { getDailyRange } from "../services/weatherService.js";
import { toJson, toXml, toCsv, toMarkdown, toPdf } from "../services/exportService.js";

const router = Router();

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validateDateRange(startDate, endDate) {
  if (!DATE_PATTERN.test(startDate) || !DATE_PATTERN.test(endDate)) {
    return "Dates must be in YYYY-MM-DD format.";
  }
  if (startDate > endDate) {
    return "Start date must be on or before the end date.";
  }
  const span = (new Date(endDate) - new Date(startDate)) / 86400000;
  if (span > 92) {
    return "Please keep date ranges to 92 days or fewer.";
  }
  return null;
}

// ---- CREATE ---------------------------------------------------------
// POST /api/records  { location, startDate, endDate, notes? }
router.post("/", async (req, res) => {
  try {
    const { location, startDate, endDate, notes } = req.body;

    if (!location) return res.status(400).json({ error: "`location` is required." });
    const dateError = validateDateRange(startDate, endDate);
    if (dateError) return res.status(400).json({ error: dateError });

    const place = await resolveLocation(location); // validates the location exists / fuzzy-matches it
    const dailyData = await getDailyRange(place.latitude, place.longitude, startDate, endDate);

    const record = await WeatherRecord.create({
      locationQuery: location,
      locationName: place.name,
      latitude: place.latitude,
      longitude: place.longitude,
      startDate,
      endDate,
      dailyData,
      notes: notes || "",
    });

    res.status(201).json(record);
  } catch (err) {
    handleError(res, err);
  }
});

// ---- READ -------------------------------------------------------------
// GET /api/records            -> list all (newest first)
// GET /api/records/:id        -> one record
router.get("/", async (req, res) => {
  const records = await WeatherRecord.find().sort({ createdAt: -1 });
  res.json(records);
});

router.get("/:id", async (req, res) => {
  const record = await WeatherRecord.findById(req.params.id);
  if (!record) return res.status(404).json({ error: "Record not found." });
  res.json(record);
});

// ---- UPDATE -------------------------------------------------------------
// PUT /api/records/:id  { notes?, startDate?, endDate? }
// Only notes and the date range (which re-fetches dailyData) are editable;
// location/coordinates stay fixed to keep the record's history meaningful.
router.put("/:id", async (req, res) => {
  try {
    const record = await WeatherRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: "Record not found." });

    const { notes, startDate, endDate } = req.body;

    if (startDate || endDate) {
      const newStart = startDate || record.startDate;
      const newEnd = endDate || record.endDate;
      const dateError = validateDateRange(newStart, newEnd);
      if (dateError) return res.status(400).json({ error: dateError });

      record.dailyData = await getDailyRange(record.latitude, record.longitude, newStart, newEnd);
      record.startDate = newStart;
      record.endDate = newEnd;
    }

    if (typeof notes === "string") record.notes = notes;

    await record.save();
    res.json(record);
  } catch (err) {
    handleError(res, err);
  }
});

// ---- DELETE -------------------------------------------------------------
router.delete("/:id", async (req, res) => {
  const record = await WeatherRecord.findByIdAndDelete(req.params.id);
  if (!record) return res.status(404).json({ error: "Record not found." });
  res.status(204).end();
});

// ---- EXPORT -------------------------------------------------------------
// GET /api/records/export/all?format=json|xml|csv|markdown|pdf
router.get("/export/all", async (req, res) => {
  const format = (req.query.format || "json").toLowerCase();
  const records = await WeatherRecord.find().sort({ createdAt: -1 });

  try {
    switch (format) {
      case "json":
        return send(res, "application/json", "weather-records.json", toJson(records));
      case "xml":
        return send(res, "application/xml", "weather-records.xml", toXml(records));
      case "csv":
        return send(res, "text/csv", "weather-records.csv", toCsv(records));
      case "markdown":
      case "md":
        return send(res, "text/markdown", "weather-records.md", toMarkdown(records));
      case "pdf": {
        const buffer = await toPdf(records);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="weather-records.pdf"');
        return res.send(buffer);
      }
      default:
        return res.status(400).json({ error: "format must be one of json, xml, csv, markdown, pdf" });
    }
  } catch (err) {
    console.error("[export]", err);
    res.status(500).json({ error: "Export failed." });
  }
});

function send(res, contentType, filename, body) {
  res.setHeader("Content-Type", `${contentType}; charset=utf-8`);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(body);
}

function handleError(res, err) {
  if (err instanceof LocationError) {
    return res.status(err.status || 404).json({ error: err.message });
  }
  console.error("[records route]", err);
  res.status(500).json({ error: "Something went wrong handling that record." });
}

export default router;
