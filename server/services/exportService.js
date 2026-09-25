import { parse as createXml } from "js2xmlparser";
import PDFDocument from "pdfkit";

/** Flatten a Mongoose record into a plain, export-friendly object. */
function plain(record) {
  const r = record.toObject ? record.toObject() : record;
  return {
    id: String(r._id),
    locationQuery: r.locationQuery,
    locationName: r.locationName,
    latitude: r.latitude,
    longitude: r.longitude,
    startDate: r.startDate,
    endDate: r.endDate,
    notes: r.notes || "",
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    dailyData: (r.dailyData || []).map((d) => ({
      date: d.date,
      tempMaxC: d.tempMaxC,
      tempMinC: d.tempMinC,
      weatherCode: d.weatherCode,
      summary: d.summary,
    })),
  };
}

export function toJson(records) {
  return JSON.stringify(records.map(plain), null, 2);
}

export function toXml(records) {
  return createXml("weatherRecords", { record: records.map(plain) }, { format: { doubleQuotes: false } });
}

export function toCsv(records) {
  const header = [
    "id",
    "locationName",
    "latitude",
    "longitude",
    "startDate",
    "endDate",
    "date",
    "tempMaxC",
    "tempMinC",
    "summary",
  ];
  const rows = [header.join(",")];

  for (const rec of records.map(plain)) {
    const days = rec.dailyData.length ? rec.dailyData : [{}];
    for (const day of days) {
      const row = [
        rec.id,
        csvField(rec.locationName),
        rec.latitude,
        rec.longitude,
        rec.startDate,
        rec.endDate,
        day.date || "",
        day.tempMaxC ?? "",
        day.tempMinC ?? "",
        csvField(day.summary || ""),
      ];
      rows.push(row.join(","));
    }
  }
  return rows.join("\n");
}

function csvField(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function toMarkdown(records) {
  const lines = ["# Weather Records Export", ""];
  for (const rec of records.map(plain)) {
    lines.push(`## ${rec.locationName} (${rec.startDate} → ${rec.endDate})`);
    lines.push("");
    lines.push(`- Query: \`${rec.locationQuery}\``);
    lines.push(`- Coordinates: ${rec.latitude}, ${rec.longitude}`);
    if (rec.notes) lines.push(`- Notes: ${rec.notes}`);
    lines.push("");
    if (rec.dailyData.length) {
      lines.push("| Date | High (°C) | Low (°C) | Conditions |");
      lines.push("| --- | --- | --- | --- |");
      for (const day of rec.dailyData) {
        lines.push(`| ${day.date} | ${day.tempMaxC ?? "-"} | ${day.tempMinC ?? "-"} | ${day.summary || "-"} |`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

/** Streams a PDF into a Buffer via pdfkit. */
export function toPdf(records) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text("Weather Records Export", { underline: true });
    doc.moveDown();

    for (const rec of records.map(plain)) {
      doc.fontSize(13).text(`${rec.locationName}  (${rec.startDate} to ${rec.endDate})`);
      doc.fontSize(10).fillColor("#555").text(`Query: ${rec.locationQuery}  |  ${rec.latitude}, ${rec.longitude}`);
      if (rec.notes) doc.text(`Notes: ${rec.notes}`);
      doc.fillColor("#000");
      doc.moveDown(0.3);

      for (const day of rec.dailyData) {
        doc
          .fontSize(10)
          .text(`  ${day.date}:  high ${fmt(day.tempMaxC)}°C / low ${fmt(day.tempMinC)}°C  — ${day.summary || "n/a"}`);
      }
      doc.moveDown();
    }

    if (!records.length) {
      doc.fontSize(11).text("No records to export.");
    }

    doc.end();
  });
}

function fmt(n) {
  return typeof n === "number" ? n.toFixed(1) : "?";
}
