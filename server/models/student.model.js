import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    prn_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: { type: String, required: true, trim: true },
    class: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true, uppercase: true },

    rollNo: {
      type: Number,
      min: [1, "Roll number must be a positive value"],
    },

    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },

    contactNumber: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Contact number must be 10 digits"],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    photo: {
      type: String,
      validate: {
        validator: (v) => /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/.test(v),
        message: "Invalid photo URL",
      },
    },

    rfid: {
      hex: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        match: /^[0-9A-F\s]+$/,
      },
      decimal: {
        type: String,
        required: true,
        unique: true,
      },
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    credits: {
      type: Number,
      default: 6,
      min: 0,
      max: 6,
    },
  },
  { timestamps: true }
);

studentSchema.pre("save", function (next) {
  if (this.rfid.hex && !this.rfid.decimal) {
    const hex = this.rfid.hex.replace(/\s/g, "");
    this.rfid.decimal = parseInt(hex, 16).toString();
  }

  if (this.rfid.decimal && !this.rfid.hex) {
    this.rfid.hex = parseInt(this.rfid.decimal, 10)
      .toString(16)
      .toUpperCase()
      .match(/.{1,2}/g)
      .join(" ");
  }

  next();
});

studentSchema.index({ class: 1, section: 1 });

const Students = mongoose.model("Students", studentSchema);
export default Students;
