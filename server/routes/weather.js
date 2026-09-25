import { Router } from "express";
import { resolveLocation, LocationError } from "../services/geoService.js";
import { getCurrentAndForecast } from "../services/weatherService.js";
import { buildMapLinks, getYoutubeVideos } from "../services/enrichmentService.js";

const router = Router();

/**
 * GET /api/weather?location=Baltimore
 * GET /api/weather?lat=39.29&lon=-76.61   (e.g. from browser geolocation)
 * Returns resolved location + current conditions + 5-day forecast + extras.
 */
router.get("/", async (req, res) => {
  try {
    const { location, lat, lon } = req.query;

    let place;
    if (lat && lon) {
      place = { name: `${Number(lat).toFixed(3)}, ${Number(lon).toFixed(3)}`, latitude: Number(lat), longitude: Number(lon) };
    } else if (location) {
      place = await resolveLocation(location);
    } else {
      return res.status(400).json({ error: "Provide a `location` query, or `lat` & `lon`." });
    }

    const { current, forecast, timezone } = await getCurrentAndForecast(place.latitude, place.longitude);
    const maps = buildMapLinks(place.latitude, place.longitude, place.name);
    const youtube = await getYoutubeVideos(place.name);

    res.json({ place, timezone, current, forecast, maps, youtube });
  } catch (err) {
    handleError(res, err);
  }
});

function handleError(res, err) {
  if (err instanceof LocationError) {
    return res.status(err.status || 404).json({ error: err.message });
  }
  console.error("[weather route]", err);
  res.status(502).json({ error: "Couldn't reach the weather provider. Please try again." });
}

export default router;
