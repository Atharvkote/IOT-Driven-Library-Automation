import BorrowedBook from "../models/borrowed-books.model.js";
import Book from "../models/book.model.js";
import Student from "../models/student.model.js";

// Create a new borrow request
export const createBorrowRequest = async (req, res) => {
  try {
    console.log("sbcsbhb");
    const { userId, bookId, longTermBorrow, expectedReturnDate, remarks } = req.body;

    const student = await Student.findById(userId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.credits -= 1;
    await student.save();

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // book.availableCopies -= 1;
    // await book.save();

    if (!longTermBorrow && !expectedReturnDate) {
      return res.status(400).json({ message: "Expected return date is required for non-long-term borrow" });
    }

    const borrowEntry = new BorrowedBook({
      student: student._id,
      book: book._id,
      longTerm: longTermBorrow || false,
      expectedReturnDate: expectedReturnDate || null,
      remarks: remarks || "",
      status: "Pending",
    });

    await borrowEntry.save();
    res.status(201).json({ message: "Borrow request created", borrowEntry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Fetch all borrowed books
export const getAllBorrowedBooks = async (req, res) => {
  try {
    const records = await BorrowedBook.find()
      .populate("student", "name email")
      .populate("book", "title author isbn");
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Fetch single record by ID
export const getBorrowedBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await BorrowedBook.findById(id)
      .populate("student", "name email")
      .populate("book", "title author isbn");

    if (!record) return res.status(404).json({ message: "Record not found" });

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Fetch all approved borrowed books
export const getApprovedBorrowedBooks = async (req, res) => {
  try {
    const records = await BorrowedBook.find({ status: "Approved" })
      .populate("student", "name email")
      .populate("book", "title author isbn");
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Fetch all rejected borrowed books
export const getRejectedBorrowedBooks = async (req, res) => {
  try {
    const records = await BorrowedBook.find({ status: "Rejected" })
      .populate("student", "name email")
      .populate("book", "title author isbn");
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Approve a borrow request
export const approveBorrowRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await BorrowedBook.findById(id);
    if (!record) return res.status(404).json({ message: "Borrow request not found" });

    record.status = "Approved";
    record.approvedAt = new Date();
    await record.save();

    res.json({ message: "Borrow request approved", record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Reject a borrow request
export const rejectBorrowRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await BorrowedBook.findById(id);
    if (!record) return res.status(404).json({ message: "Borrow request not found" });

    record.status = "Rejected";
    record.rejectedAt = new Date();
    await record.save();

    res.json({ message: "Borrow request rejected", record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


export const verifyBorrowRequest = async (req, res) => {
  try {
    const { studentId, bookId } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    const borrowRecord = await BorrowedBook.findOne({ student: studentId, book: bookId });

    if (!borrowRecord) {
      return res.status(404).json({
        success: false,
        message: "No borrow request found for this student and book"
      });
    }

    if (borrowRecord.status === "Approved") {
      return res.status(200).json({
        success: true,
        message: "Borrow request is already approved",
        data: borrowRecord
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "Borrow request is not approved yet",
        data: borrowRecord
      });
    }

  } catch (error) {
    console.error("verifyBorrowRequest error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
