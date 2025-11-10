import { Router } from "express";
import {
  calculateFines,
  getAllFines,
  getStudentFines,
  markFineAsPaid,
  deleteFine,
} from "../controller/fines.controller.js";

const router = Router();

// Calculate fines (cron job endpoint)
router.get("/calculate", calculateFines);

// Get all fines (with optional filters)
router.get("/", getAllFines);

// Get fines for a specific student
router.get("/student/:studentId", getStudentFines);

// Mark fine as paid
router.patch("/:fineId/paid", markFineAsPaid);

// Delete fine (after payment)
router.delete("/:fineId", deleteFine);

export default router;
