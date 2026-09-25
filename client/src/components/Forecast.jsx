export default function Forecast({ days }) {
  if (!days?.length) return null;

  return (
    <section className="forecast">
      <h2>5-day forecast</h2>
      <div className="forecast-strip">
        {days.map((day) => (
          <article key={day.date} className="forecast-card">
            <p className="forecast-day">{weekday(day.date)}</p>
            <p className="forecast-icon">{day.icon}</p>
            <p className="forecast-temps">
              <span className="hi">{Math.round(day.tempMaxC)}°</span>
              <span className="lo">{Math.round(day.tempMinC)}°</span>
            </p>
            <p className="forecast-summary">{day.summary}</p>
            {typeof day.precipitationChancePct === "number" && (
              <p className="forecast-precip">💧 {day.precipitationChancePct}%</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function weekday(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" });
}
