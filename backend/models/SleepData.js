const mongoose = require("mongoose");

const sleepDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    sleepTime: {
      type: String, // e.g. "22:30"
      required: [true, "Sleep time is required"],
    },
    wakeTime: {
      type: String, // e.g. "06:30"
      required: [true, "Wake time is required"],
    },
    sleepDuration: {
      type: Number, // stored in hours, e.g. 8.0
      required: [true, "Sleep duration is required"],
      min: [0, "Sleep duration cannot be negative"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    quality: {
      type: String,
      enum: ["Poor", "Fair", "Good", "Excellent"],
      default: "Good",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SleepData", sleepDataSchema);
