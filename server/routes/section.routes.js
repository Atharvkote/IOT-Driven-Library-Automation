import express from "express";
import {
  incrementVisit,
  incrementBooksBought,
} from "../controller/section.controller.js";

const router = express.Router();

// Route to increment visit count
router.post("/scan", incrementVisit);

// Route to increment books bought count
router.post("/book", incrementBooksBought);

export default router;
