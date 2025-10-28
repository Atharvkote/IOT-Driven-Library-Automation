import finesModel from "../models/fines.model.js";
import BorrowedBook from "../models/borrowed-books.model.js";
import { sendFineNotifications } from "../utils/twilio.js";
import logger from "../utils/logger.js";

const FINE_PER_DAY = 5; // ₹5 per overdue day

export const calculateFines = async () => {
  const today = new Date();

  const borrowedBooks = await BorrowedBook.find()
    .populate("student", "name prn_number whatsappNumber")
    .populate("book", "title");
  for (const book of borrowedBooks) {
    // Skip books without expected return date
    if (!book.expectedReturnDate) continue;

    // Only if book not returned and past expected return date
    if (!book.returnDate && book.expectedReturnDate < today) {
      const overdueDays = Math.ceil(
        (today.getTime() - book.expectedReturnDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const fineAmount = overdueDays * FINE_PER_DAY;

      // Upsert fine
      await finesModel.findOneAndUpdate(
        { borrowedBook: book._id },
        {
          amount: fineAmount,
          reason: `Overdue by ${overdueDays} day(s)`,
        },
        { upsert: true, new: true }
      );

      logger.info(
        `Fine updated for ${book.book.title} (${book.student.name}) — ₹${fineAmount}`
      );
    }
  }

  logger.info("✅ Daily fine calculation completed:", new Date());

  // Send WhatsApp notifications for all unpaid fines
  const fines = await finesModel.find({ paid: false }).populate({
    path: "borrowedBook",
    populate: [
      { path: "student", select: "name prn_number whatsappNumber" },
      { path: "book", select: "title" },
    ],
  });

  // await sendFineNotifications(fines);
};
