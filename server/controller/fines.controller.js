import finesModel from "../models/fines.model.js";
import BorrowedBook from "../models/borrowed-books.model.js"

export const calculateFines = async () => {
  const today = new Date();

  const borrowedBooks = await BorrowedBook.find()
    .populate("student", "name prn_number")
    .populate("book", "title");

  for (const book of borrowedBooks) {
    if (!book.returnDate || book.returnDate < today) {
      const dueDate = book.dueDate;
      const returnedDate = book.returnDate || today;
      let overdueDays = Math.ceil(
        (returnedDate?.getTime() - dueDate?.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (overdueDays > 0) {
        const fineAmount = overdueDays * FINE_PER_DAY;

        const existingFine = await finesModel.findOne({
          borrowedBook: book._id,
        });

        if (existingFine) {
          existingFine.amount = fineAmount;
          await existingFine.save();
        } else {
          await finesModel.create({
            borrowedBook: book._id,
            amount: fineAmount,
            reason: `Overdue by ${overdueDays} day(s)`,
          });
        }
      }
    }
  }

  console.log("Daily fine calculation completed:", new Date());
};

