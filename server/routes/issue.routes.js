import express from "express";
import {
  createBorrowRequest,
  getAllBorrowedBooks,
  getBorrowedBookById,
  getApprovedBorrowedBooks,
  getRejectedBorrowedBooks,
  approveBorrowRequest,
  rejectBorrowRequest,
  verifyBorrowRequest,
} from "../controller/issue.controller.js";

const router = express.Router();

// Create a new borrow request
router.post("/", createBorrowRequest);

// Fetch all borrowed books
router.get("/", getAllBorrowedBooks);

router.post("/verify", verifyBorrowRequest);

// Fetch a single borrowed book by ID
router.get("/:id", getBorrowedBookById);

// Fetch approved borrowed books
router.get("/status/approved", getApprovedBorrowedBooks);

// Fetch rejected borrowed books
router.get("/status/rejected", getRejectedBorrowedBooks);

// Approve a borrow request by ID
router.patch("/approve/:id", approveBorrowRequest);

// Reject a borrow request by ID
router.patch("/reject/:id", rejectBorrowRequest);

export default router;
