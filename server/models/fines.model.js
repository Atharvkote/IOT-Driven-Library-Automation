import mongoose from "mongoose";

const { Schema, model } = mongoose;

const finesCollectionSchema = new Schema(
  {
    borrowedBook: {
      type: Schema.Types.ObjectId,
      ref: "BorrowedBook",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      default: "Late return",
    },
    paid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);


const finesModel = model("Fines", finesCollectionSchema);

export default finesModel;
