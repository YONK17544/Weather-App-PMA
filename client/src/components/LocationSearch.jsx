import { useState } from "react";

export default function LocationSearch({ onSearch, loading }) {
  const [text, setText] = useState("");
  const [geoError, setGeoError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSearch({ kind: "text", text: text.trim() });
  }

  function useMyLocation() {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("Your browser doesn't support geolocation.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onSearch({ kind: "coords", lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => setGeoError(err.message || "Couldn't get your location.")
    );
  }

  return (
    <form className="search-row" onSubmit={submit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="City, zip code, landmark, or lat,lon"
        aria-label="Location"
      />
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Looking up…" : "Get weather"}
      </button>
      <button type="button" className="btn-ghost" onClick={useMyLocation} disabled={loading}>
        Use my location
      </button>
      {geoError && <span className="inline-error">{geoError}</span>}
    </form>
  );
}
