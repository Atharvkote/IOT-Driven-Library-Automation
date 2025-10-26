import mongoose from "mongoose";
const borrowedBookSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Students", // matches your DB collection
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book", // matches your DB collection
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    borrowedDate: {
      type: Date,
      default: Date.now,
    },
    expectedReturnDate: {
      type: Date,
      required: function () {
        return !this.longTerm;
      },
    },
    longTerm: {
      type: Boolean,
      default: false,
    },
    returnDate: {
      type: Date,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

const BorrowedBook = mongoose.model("BorrowedBook", borrowedBookSchema,); // third param is collection name

export default BorrowedBook;
