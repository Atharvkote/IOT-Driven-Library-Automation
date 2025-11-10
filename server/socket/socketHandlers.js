/**
 * @file socketHandlers.js
 * @description Organized Socket.IO event handlers following industry standards
 * Separates concerns and makes the code maintainable
 */

import Book from "../models/book.model.js";
import Students from "../models/student.model.js";
import BorrowedBook from "../models/borrowed-books.model.js";
import Section from "../models/section.model.js";
import { socketioLogger } from "../utils/logger.js";

/**
 * Initialize all socket event handlers
 * @param {Server} io - Socket.IO server instance
 */
export const initializeSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.setMaxListeners(20);
    socketioLogger.info(`New socket connected: ${socket.id}`);

    const { studentId } = socket.handshake.query;
    socketioLogger.info("Student ID from socket query:", studentId);

    // Store studentId in socket data for later use
    socket.data.studentId = studentId;

    // ==================== ADMIN HANDLERS ====================

    /**
     * Get all borrow requests (Admin only)
     */
    socket.on("getBorrowRequests", async () => {
      try {
        const requests = await BorrowedBook.find()
          .populate("student", "name email prn_number")
          .populate("book", "title author isbn availableCopies totalCopies")
          .sort({ createdAt: -1 })
          .lean();

        socket.emit("borrowRequests", requests);
        socketioLogger.info(`Sent ${requests.length} borrow requests to admin`);
      } catch (err) {
        socketioLogger.error("Error fetching borrow requests:", err);
        socket.emit("borrowRequestsError", { message: "Failed to fetch requests" });
      }
    });

    /**
     * Approve borrow request (Admin)
     */
    socket.on("approveBorrowRequest", async (requestId) => {
      try {
        const req = await BorrowedBook.findByIdAndUpdate(
          requestId,
          { status: "Approved" },
          { new: true }
        )
          .populate("book")
          .populate("student")
          .lean();

        if (!req) {
          socket.emit("error", { message: "Request not found" });
          return;
        }

        // Notify admin
        socket.emit("borrowRequestsUpdated", req);

        // Notify the student who made the request via room
        const studentId = req.student?._id?.toString();
        if (studentId) {
          io.to(`student:${studentId}`).emit("myBorrowRequestUpdated", req);
        }

        socketioLogger.info(`Request ${requestId} approved`);
      } catch (err) {
        socketioLogger.error("Error approving request:", err);
        socket.emit("error", { message: "Failed to approve request" });
      }
    });

    /**
     * Reject borrow request (Admin)
     */
    socket.on("rejectBorrowRequest", async (requestId) => {
      try {
        const req = await BorrowedBook.findByIdAndUpdate(
          requestId,
          { status: "Rejected" },
          { new: true }
        )
          .populate("book")
          .populate("student")
          .lean();

        if (!req) {
          socket.emit("error", { message: "Request not found" });
          return;
        }

        // Notify admin
        socket.emit("borrowRequestsUpdated", req);

        // Notify the student who made the request via room
        const studentId = req.student?._id?.toString();
        if (studentId) {
          io.to(`student:${studentId}`).emit("myBorrowRequestUpdated", req);
        }

        socketioLogger.info(`Request ${requestId} rejected`);
      } catch (err) {
        socketioLogger.error("Error rejecting request:", err);
        socket.emit("error", { message: "Failed to reject request" });
      }
    });

    // ==================== STUDENT HANDLERS ====================

    /**
     * Get borrow requests for logged-in student
     */
    socket.on("getMyBorrowRequests", async () => {
      try {
        const studentId = socket.data.studentId || socket.handshake.query.studentId;
        
        if (!studentId) {
          socket.emit("myBorrowRequestsError", { 
            message: "Student ID required. Please reconnect with studentId." 
          });
          socketioLogger.warn("getMyBorrowRequests called without studentId");
          return;
        }

        const student = await Students.findById(studentId).lean();
        if (!student) {
          socket.emit("myBorrowRequestsError", { message: "Student not found" });
          return;
        }

        // Join room for this student to receive updates
        socket.join(`student:${studentId}`);

        const requests = await BorrowedBook.find({ student: studentId })
          .populate("book")
          .sort({ createdAt: -1 })
          .lean();

        socket.emit("myBorrowRequests", { requests, student });
        socketioLogger.info(`Sent ${requests.length} requests to student ${studentId}`);
      } catch (err) {
        socketioLogger.error("Error fetching student borrow requests:", err);
        socket.emit("myBorrowRequestsError", { message: "Failed to fetch requests" });
      }
    });

    /**
     * Update borrow request status (internal)
     */
    socket.on("updateBorrowRequest", async ({ requestId, newStatus }) => {
      try {
        const updated = await BorrowedBook.findByIdAndUpdate(
          requestId,
          { status: newStatus },
          { new: true }
        )
          .populate("book")
          .populate("student")
          .lean();

        if (!updated) {
          socket.emit("error", { message: "Request not found" });
          return;
        }

        // Notify the student via room
        const studentId = updated.student?._id?.toString();
        if (studentId) {
          io.to(`student:${studentId}`).emit("myBorrowRequestUpdated", updated);
        }

        socketioLogger.info(`Request ${requestId} updated to ${newStatus}`);
      } catch (err) {
        socketioLogger.error("Error updating borrow request:", err);
        socket.emit("error", { message: "Failed to update request" });
      }
    });

    // ==================== BOOK HANDLERS ====================

    /**
     * Search books
     */
    socket.on("searchBooks", async (query) => {
      try {
        if (!query || query.trim().length === 0) {
          socket.emit("searchResults", [], null);
          return;
        }

        const regex = new RegExp(query.trim(), "i");
        const books = await Book.find({
          $or: [
            { title: regex },
            { author: regex },
            { isbn: regex },
            { publisher: regex }
          ],
        })
          .limit(20)
          .lean();

        const studentId = socket.data.studentId || socket.handshake.query.studentId;
        const user = studentId ? await Students.findById(studentId).lean() : null;

        socket.emit("searchResults", books, user);
        socketioLogger.info(`Search results for "${query}": ${books.length} books`);
      } catch (err) {
        socketioLogger.error("Error searching books:", err);
        socket.emit("searchResults", [], null);
      }
    });

    /**
     * Get book details
     */
    socket.on("getBookDetails", async (bookId) => {
      try {
        const book = await Book.findById(bookId).lean();
        if (!book) {
          socket.emit("bookDetails", { error: "Book not found" });
          return;
        }
        socket.emit("bookDetails", book);
      } catch (err) {
        socketioLogger.error("Error fetching book details:", err);
        socket.emit("bookDetails", { error: "Failed to fetch book details" });
      }
    });

    // ==================== STATS HANDLERS ====================

    /**
     * Get section statistics
     */
    socket.on("getSectionStats", async () => {
      try {
        const sections = await Section.find({
          sectionName: "Computer Science",
        })
          .select("sectionName visitCount booksBoughtCount shelfCount")
          .lean();

        socket.emit("sectionStats", sections);
      } catch (err) {
        socketioLogger.error("Error fetching section stats:", err);
        socket.emit("sectionStatsError", {
          message: "Failed to fetch section stats",
        });
      }
    });

    // ==================== CONNECTION HANDLERS ====================

    /**
     * Handle socket disconnection
     */
    socket.on("disconnect", (reason) => {
      socketioLogger.info(`Socket disconnected: ${socket.id}, reason: ${reason}`);
    });

    /**
     * Handle errors
     */
    socket.on("error", (error) => {
      socketioLogger.error(`Socket error for ${socket.id}:`, error);
    });
  });
};

