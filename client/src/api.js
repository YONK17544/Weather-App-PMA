const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* non-JSON error body, keep the default message */
    }
    throw new Error(message);
  }

  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json") ? res.json() : res.text();
}

export const api = {
  getWeather: (location) => request(`/weather?location=${encodeURIComponent(location)}`),
  getWeatherByCoords: (lat, lon) => request(`/weather?lat=${lat}&lon=${lon}`),

  listRecords: () => request(`/records`),
  getRecord: (id) => request(`/records/${id}`),
  createRecord: (payload) => request(`/records`, { method: "POST", body: JSON.stringify(payload) }),
  updateRecord: (id, payload) => request(`/records/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteRecord: (id) => request(`/records/${id}`, { method: "DELETE" }),

  exportUrl: (format) => `${BASE}/records/export/all?format=${format}`,
};
