export default function CurrentWeather({ result }) {
  const { place, current, maps, youtube } = result;

  return (
    <section className="current-hero">
      <div className="current-main">
        <p className="place-name">{place.name}</p>
        <div className="temp-row">
          <span className="temp-icon">{current.icon}</span>
          <span className="temp-value">{round(current.temperatureC)}°C</span>
        </div>
        <p className="temp-summary">{current.summary}</p>
        <p className="feels-like">Feels like {round(current.feelsLikeC)}°C</p>
      </div>

      <div className="current-stats">
        <Stat label="Humidity" value={`${round(current.humidityPct)}%`} />
        <Stat label="Wind" value={`${round(current.windSpeedKmh)} km/h`} />
        <Stat label="Precipitation" value={`${current.precipitationMm ?? 0} mm`} />
      </div>

      <div className="current-extras">
        <a className="map-link" href={maps.viewUrl} target="_blank" rel="noreferrer">
          Open in Google Maps ↗
        </a>
        <iframe
          className="map-embed"
          title="Location map"
          src={maps.embedUrl}
          loading="lazy"
        />

        <div className="youtube-block">
          {youtube.videos.length > 0 ? (
            <ul className="video-list">
              {youtube.videos.map((v) => (
                <li key={v.videoId}>
                  <a href={v.url} target="_blank" rel="noreferrer">
                    {v.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <a className="video-fallback" href={youtube.searchUrl} target="_blank" rel="noreferrer">
              Search YouTube for {place.name} ↗
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function round(n) {
  return typeof n === "number" ? Math.round(n) : "—";
}
