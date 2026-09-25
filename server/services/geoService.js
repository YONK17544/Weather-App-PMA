import fetch from "node-fetch";

const COORD_PATTERN = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;
const US_ZIP_PATTERN = /^\s*\d{5}(-\d{4})?\s*$/;

/**
 * Resolve a free-text location (GPS coords, US zip code, or a
 * town/city/landmark name) into a canonical { name, latitude, longitude }.
 * Throws a descriptive Error the route layer can turn into a 4xx response.
 */
export async function resolveLocation(rawInput) {
  const input = (rawInput || "").trim();
  if (!input) {
    throw new LocationError("Please enter a location.");
  }

  const coordMatch = input.match(COORD_PATTERN);
  if (coordMatch) {
    const latitude = Number(coordMatch[1]);
    const longitude = Number(coordMatch[2]);
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      throw new LocationError("Those coordinates are out of range.");
    }
    return {
      name: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
      latitude,
      longitude,
    };
  }

  if (US_ZIP_PATTERN.test(input)) {
    const zip = input.slice(0, 5);
    const place = await resolveZip(zip);
    if (place) return place;
    // fall through to name search if the zip lookup comes up empty
  }

  const place = await resolveByName(input);
  if (!place) {
    throw new LocationError(
      `Couldn't find a location matching "${input}". Try a city name, a US zip code, or "lat,lon".`
    );
  }
  return place;
}

async function resolveZip(zip) {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!res.ok) return null;
    const data = await res.json();
    const place = data.places?.[0];
    if (!place) return null;
    return {
      name: `${place["place name"]}, ${place["state abbreviation"]} ${zip}`,
      latitude: Number(place.latitude),
      longitude: Number(place.longitude),
    };
  } catch {
    return null;
  }
}

async function resolveByName(name) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", name);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const hit = data.results?.[0];
  if (!hit) return null;

  const parts = [hit.name, hit.admin1, hit.country].filter(Boolean);
  return {
    name: parts.join(", "),
    latitude: hit.latitude,
    longitude: hit.longitude,
  };
}

export class LocationError extends Error {
  constructor(message) {
    super(message);
    this.name = "LocationError";
    this.status = 404;
  }
}
