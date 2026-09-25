import { api } from "../api.js";

const FORMATS = [
  { id: "json", label: "JSON" },
  { id: "xml", label: "XML" },
  { id: "csv", label: "CSV" },
  { id: "markdown", label: "Markdown" },
  { id: "pdf", label: "PDF" },
];

export default function ExportPanel() {
  return (
    <div className="export-panel">
      <span className="export-label">Export all records:</span>
      {FORMATS.map((f) => (
        <a key={f.id} className="btn-ghost small" href={api.exportUrl(f.id)}>
          {f.label}
        </a>
      ))}
    </div>
  );
}
