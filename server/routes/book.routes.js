import express from "express";
import {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  getBooksWithStockAnalytics
} from "../controller/book.controller.js";

const router = express.Router();

// Routes
router.post("/", createBook);
router.get("/analytics/stock", getBooksWithStockAnalytics); // Must come before /:id
router.get("/", getBooks);
router.get("/:id", getBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook); 

export default router;
