import mongoose from "mongoose";

const dailyPointSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // ISO date, e.g. "2026-09-20"
    tempMaxC: { type: Number },
    tempMinC: { type: Number },
    weatherCode: { type: Number },
    summary: { type: String },
  },
  { _id: false }
);

const weatherRecordSchema = new mongoose.Schema(
  {
    // What the user typed in ("Baltimore", "21201", "39.29,-76.61")
    locationQuery: { type: String, required: true, trim: true },
    // Resolved, canonical place info from geocoding
    locationName: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },

    startDate: { type: String, required: true }, // ISO date
    endDate: { type: String, required: true }, // ISO date

    dailyData: { type: [dailyPointSchema], default: [] },

    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

weatherRecordSchema.index({ locationName: 1, startDate: 1, endDate: 1 });

export default mongoose.model("WeatherRecord", weatherRecordSchema);
