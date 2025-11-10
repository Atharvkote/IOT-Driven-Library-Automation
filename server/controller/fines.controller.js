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

// Get all fines
export const getAllFines = async (req, res) => {
  try {
    const { paid, studentId } = req.query;
    
    let query = {};
    if (paid !== undefined) {
      query.paid = paid === 'true';
    }

    let fines = await finesModel.find(query)
      .populate({
        path: "borrowedBook",
        populate: [
          { path: "student", select: "name prn_number email contactNumber" },
          { path: "book", select: "title author isbn" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter by studentId if provided
    if (studentId) {
      fines = fines.filter(fine => 
        fine.borrowedBook?.student?._id?.toString() === studentId
      );
    }

    res.status(200).json({
      success: true,
      fines,
      total: fines.length,
      unpaid: fines.filter(f => !f.paid).length,
      paid: fines.filter(f => f.paid).length,
    });
  } catch (error) {
    console.error("Error fetching fines:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get fines for a specific student
export const getStudentFines = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const fines = await finesModel.find()
      .populate({
        path: "borrowedBook",
        populate: [
          { path: "student", select: "name prn_number email contactNumber" },
          { path: "book", select: "title author isbn" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter by studentId
    const studentFines = fines.filter(fine => 
      fine.borrowedBook?.student?._id?.toString() === studentId
    );

    const totalAmount = studentFines
      .filter(f => !f.paid)
      .reduce((sum, f) => sum + (f.amount || 0), 0);

    res.status(200).json({
      success: true,
      fines: studentFines,
      total: studentFines.length,
      unpaid: studentFines.filter(f => !f.paid).length,
      paid: studentFines.filter(f => f.paid).length,
      totalAmount,
    });
  } catch (error) {
    console.error("Error fetching student fines:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Mark fine as paid (or delete if user wants)
export const markFineAsPaid = async (req, res) => {
  try {
    const { fineId } = req.params;

    if (!fineId) {
      return res.status(400).json({
        success: false,
        message: "Fine ID is required",
      });
    }

    const fine = await finesModel.findByIdAndUpdate(
      fineId,
      {
        paid: true,
        paidAt: new Date(),
      },
      { new: true }
    )
      .populate({
        path: "borrowedBook",
        populate: [
          { path: "student", select: "name prn_number" },
          { path: "book", select: "title" },
        ],
      })
      .lean();

    if (!fine) {
      return res.status(404).json({
        success: false,
        message: "Fine not found",
      });
    }

    logger.info(`Fine marked as paid: ${fineId} - ₹${fine.amount}`);

    res.status(200).json({
      success: true,
      message: "Fine marked as paid successfully",
      fine,
    });
  } catch (error) {
    console.error("Error marking fine as paid:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Delete fine (after payment confirmation)
export const deleteFine = async (req, res) => {
  try {
    const { fineId } = req.params;

    if (!fineId) {
      return res.status(400).json({
        success: false,
        message: "Fine ID is required",
      });
    }

    const fine = await finesModel.findByIdAndDelete(fineId).lean();

    if (!fine) {
      return res.status(404).json({
        success: false,
        message: "Fine not found",
      });
    }

    logger.info(`Fine deleted: ${fineId} - ₹${fine.amount}`);

    res.status(200).json({
      success: true,
      message: "Fine deleted successfully",
      fine,
    });
  } catch (error) {
    console.error("Error deleting fine:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};