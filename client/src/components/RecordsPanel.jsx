import { useEffect, useState } from "react";
import { api } from "../api.js";
import ExportPanel from "./ExportPanel.jsx";

const emptyForm = { location: "", startDate: "", endDate: "", notes: "" };

export default function RecordsPanel() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ notes: "", startDate: "", endDate: "" });

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setRecords(await api.listRecords());
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.createRecord(form);
      setForm(emptyForm);
      await refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this record?")) return;
    await api.deleteRecord(id);
    await refresh();
  }

  function startEdit(record) {
    setEditingId(record._id);
    setEditDraft({ notes: record.notes || "", startDate: record.startDate, endDate: record.endDate });
  }

  async function saveEdit(id) {
    await api.updateRecord(id, editDraft);
    setEditingId(null);
    await refresh();
  }

  return (
    <section className="records">
      <form className="record-form" onSubmit={handleCreate}>
        <h2>Save a new lookup</h2>
        <div className="form-grid">
          <label>
            Location
            <input
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Baltimore, 21201, or 39.29,-76.61"
            />
          </label>
          <label>
            Start date
            <input
              required
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </label>
          <label>
            End date
            <input
              required
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </label>
          <label className="notes-field">
            Notes
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional"
            />
          </label>
        </div>
        {formError && <p className="error-banner">{formError}</p>}
        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save record"}
        </button>
      </form>

      <div className="records-header">
        <h2>Saved records ({records.length})</h2>
        <ExportPanel />
      </div>

      {records.length === 0 && <p className="empty-state">No records yet — save a lookup above to get started.</p>}

      <ul className="record-list">
        {records.map((r) => (
          <li key={r._id} className="record-card">
            <div className="record-summary" onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}>
              <div>
                <p className="record-place">{r.locationName}</p>
                <p className="record-range">
                  {r.startDate} → {r.endDate}
                </p>
              </div>
              <span className="chevron">{expandedId === r._id ? "▲" : "▼"}</span>
            </div>

            {expandedId === r._id && (
              <div className="record-detail">
                {editingId === r._id ? (
                  <div className="edit-row">
                    <input
                      type="date"
                      value={editDraft.startDate}
                      onChange={(e) => setEditDraft({ ...editDraft, startDate: e.target.value })}
                    />
                    <input
                      type="date"
                      value={editDraft.endDate}
                      onChange={(e) => setEditDraft({ ...editDraft, endDate: e.target.value })}
                    />
                    <input
                      value={editDraft.notes}
                      placeholder="Notes"
                      onChange={(e) => setEditDraft({ ...editDraft, notes: e.target.value })}
                    />
                    <button className="btn-primary small" onClick={() => saveEdit(r._id)}>
                      Save
                    </button>
                    <button className="btn-ghost small" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="record-actions">
                    {r.notes && <p className="record-notes">“{r.notes}”</p>}
                    <button className="btn-ghost small" onClick={() => startEdit(r)}>
                      Edit
                    </button>
                    <button className="btn-danger small" onClick={() => handleDelete(r._id)}>
                      Delete
                    </button>
                  </div>
                )}

                <table className="daily-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>High</th>
                      <th>Low</th>
                      <th>Conditions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.dailyData.map((d) => (
                      <tr key={d.date}>
                        <td>{d.date}</td>
                        <td>{round(d.tempMaxC)}°C</td>
                        <td>{round(d.tempMinC)}°C</td>
                        <td>{d.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function round(n) {
  return typeof n === "number" ? Math.round(n) : "—";
}
