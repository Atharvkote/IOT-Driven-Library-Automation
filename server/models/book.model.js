import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    self_id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
      immutable: true,
    },

    book_id: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },

    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    publisher: { type: String, trim: true },

    isbn: {
      type: String,
      required: true,
      unique: true,
      match: [/^(97(8|9))?\d{9}(\d|X)$/, "Invalid ISBN number"],
    },

    section: {
      type: String,
      required: true,
      default: "Computer Science",
    },

    genre: { type: String, trim: true },
    language: { type: String, default: "English", trim: true },
    publicationYear: { type: Number, min: 1500, max: new Date().getFullYear() },

    coverImage: {
      type: String,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/.test(v),
        message: "Invalid image URL",
      },
    },

    description: { type: String, trim: true },

    status: {
      type: String,
      enum: ["Available", "Issued", "Lost", "Damaged"],
      default: "Available",
    },

    totalCopies: { type: Number, default: 1, min: 0 },
    availableCopies: { type: Number, default: 1, min: 0 },

    rack: { type: String, trim: true },
    shelf: { type: String, trim: true },

    tags: [{ type: String, trim: true }],

    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Auto-generate book_id based on section
bookSchema.pre("save", async function (next) {
  if (!this.book_id && this.section) {
    const prefix = this.section.match(/\b\w/g).join("").toUpperCase();

    const lastBook = await mongoose
      .model("Book")
      .findOne({ book_id: { $regex: `^${prefix}-` } })
      .sort({ createdAt: -1 });

    const nextNumber = lastBook
      ? String(parseInt(lastBook.book_id.split("-")[1]) + 1).padStart(4, "0")
      : "0001";

    this.book_id = `${prefix}-${nextNumber}`;
  }

  next();
});

bookSchema.index({ title: 1, author: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ section: 1 });

const Book = mongoose.model("Book", bookSchema);
export default Book;
