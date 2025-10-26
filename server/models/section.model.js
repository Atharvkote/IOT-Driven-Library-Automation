import mongoose from "mongoose";

const sectionStatsSchema = new mongoose.Schema(
  {
    sectionName: {
      type: String,
      required: true,
      unique: true,
      default:"Computer Science",
      trim: true,
      uppercase: true,
    },

    visitCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    booksBoughtCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    shelfCount: {
      type: Number,          // Number of shelves/racks
      required: true,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true }
);

const Section = mongoose.model("Section", sectionStatsSchema);
export default Section;
