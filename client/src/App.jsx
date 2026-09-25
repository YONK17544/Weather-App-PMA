import { useState } from "react";
import LocationSearch from "./components/LocationSearch.jsx";
import CurrentWeather from "./components/CurrentWeather.jsx";
import Forecast from "./components/Forecast.jsx";
import RecordsPanel from "./components/RecordsPanel.jsx";
import { api } from "./api.js";

export default function App() {
  const [tab, setTab] = useState("lookup");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runLookup(query) {
    setLoading(true);
    setError("");
    try {
      const data =
        query.kind === "coords"
          ? await api.getWeatherByCoords(query.lat, query.lon)
          : await api.getWeather(query.text);
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err.message || "Something went wrong looking that up.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">Skyline</span>
          <span className="brand-tag">weather lookup</span>
        </div>
        <nav className="tabs">
          <button className={tab === "lookup" ? "tab active" : "tab"} onClick={() => setTab("lookup")}>
            Lookup
          </button>
          <button className={tab === "records" ? "tab active" : "tab"} onClick={() => setTab("records")}>
            Saved records
          </button>
        </nav>
      </header>

      <main className="content">
        {tab === "lookup" && (
          <section className="lookup">
            <LocationSearch onSearch={runLookup} loading={loading} />

            {error && <p className="error-banner">{error}</p>}

            {result && (
              <>
                <CurrentWeather result={result} />
                <Forecast days={result.forecast} />
              </>
            )}
          </section>
        )}

        {tab === "records" && <RecordsPanel />}
      </main>
    </div>
  );
}
