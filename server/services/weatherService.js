import fetch from "node-fetch";

// WMO weather codes -> short human summary + emoji icon.
// Reference: https://open-meteo.com/en/docs (weathercode table)
export const WEATHER_CODES = {
  0: { summary: "Clear sky", icon: "☀️" },
  1: { summary: "Mostly clear", icon: "🌤️" },
  2: { summary: "Partly cloudy", icon: "⛅" },
  3: { summary: "Overcast", icon: "☁️" },
  45: { summary: "Fog", icon: "🌫️" },
  48: { summary: "Rime fog", icon: "🌫️" },
  51: { summary: "Light drizzle", icon: "🌦️" },
  53: { summary: "Drizzle", icon: "🌦️" },
  55: { summary: "Dense drizzle", icon: "🌦️" },
  56: { summary: "Freezing drizzle", icon: "🌧️" },
  57: { summary: "Freezing drizzle", icon: "🌧️" },
  61: { summary: "Light rain", icon: "🌧️" },
  63: { summary: "Rain", icon: "🌧️" },
  65: { summary: "Heavy rain", icon: "🌧️" },
  66: { summary: "Freezing rain", icon: "🌧️" },
  67: { summary: "Freezing rain", icon: "🌧️" },
  71: { summary: "Light snow", icon: "🌨️" },
  73: { summary: "Snow", icon: "🌨️" },
  75: { summary: "Heavy snow", icon: "❄️" },
  77: { summary: "Snow grains", icon: "❄️" },
  80: { summary: "Light showers", icon: "🌦️" },
  81: { summary: "Showers", icon: "🌦️" },
  82: { summary: "Violent showers", icon: "⛈️" },
  85: { summary: "Snow showers", icon: "🌨️" },
  86: { summary: "Heavy snow showers", icon: "🌨️" },
  95: { summary: "Thunderstorm", icon: "⛈️" },
  96: { summary: "Thunderstorm w/ hail", icon: "⛈️" },
  99: { summary: "Severe thunderstorm w/ hail", icon: "⛈️" },
};

export function describeCode(code) {
  return WEATHER_CODES[code] || { summary: "Unknown", icon: "❔" };
}

/** Current conditions + 5-day daily forecast for a coordinate pair. */
export async function getCurrentAndForecast(latitude, longitude) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation"
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
  );
  url.searchParams.set("forecast_days", "5");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather provider returned ${res.status}`);
  }
  const data = await res.json();

  const current = {
    temperatureC: data.current?.temperature_2m,
    feelsLikeC: data.current?.apparent_temperature,
    humidityPct: data.current?.relative_humidity_2m,
    windSpeedKmh: data.current?.wind_speed_10m,
    precipitationMm: data.current?.precipitation,
    weatherCode: data.current?.weather_code,
    ...describeCode(data.current?.weather_code),
    time: data.current?.time,
  };

  const forecast = (data.daily?.time || []).map((date, i) => ({
    date,
    tempMaxC: data.daily.temperature_2m_max[i],
    tempMinC: data.daily.temperature_2m_min[i],
    precipitationChancePct: data.daily.precipitation_probability_max?.[i],
    weatherCode: data.daily.weather_code[i],
    ...describeCode(data.daily.weather_code[i]),
  }));

  return { current, forecast, timezone: data.timezone };
}

/**
 * Daily temperature data for an arbitrary date range. Uses the forecast
 * endpoint for dates that fall within it (today .. +15 days) and the
 * archive/historical endpoint for anything in the past.
 */
export async function getDailyRange(latitude, longitude, startDate, endDate) {
  const today = new Date().toISOString().slice(0, 10);
  const isPast = endDate < today;

  const base = isPast
    ? "https://archive-api.open-meteo.com/v1/archive"
    : "https://api.open-meteo.com/v1/forecast";

  const url = new URL(base);
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather provider returned ${res.status} for the requested date range`);
  }
  const data = await res.json();

  return (data.daily?.time || []).map((date, i) => ({
    date,
    tempMaxC: data.daily.temperature_2m_max[i],
    tempMinC: data.daily.temperature_2m_min[i],
    weatherCode: data.daily.weather_code[i],
    summary: describeCode(data.daily.weather_code[i]).summary,
  }));
}
