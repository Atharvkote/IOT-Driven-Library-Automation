import mongoose from "mongoose";

const scanSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Students",
      required: true, // Each scan must belong to a student
    },
    scanType: {
      type: String,
      enum: ["in", "out"], // Optional: mark entry/exit
      default: "in",
    },
    scannedAt: {
      type: Date,
      default: Date.now, // Timestamp when scan occurred
      required: true,
    },
    // location: {
    //   type: String, // Optional: if you have multiple gates/locations
    //   default: "Main Gate",
    // },
    deviceId: {
      type: String, // Optional: ESP32/device identifier
    },
    rfid: {
      hex: {
        type: String,
        required: true,
        uppercase: true,
      },
      decimal: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

scanSchema.index({ student: 1, scannedAt: -1 }); // Fast query by student/date

const Scans = mongoose.model("Scans", scanSchema);
export default Scans;
