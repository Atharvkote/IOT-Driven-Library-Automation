import { Router } from "express";
import { createStudent, getStudent } from "../controller/student.controller.js";

const router = Router();

// RFID scan endpoint
router.post("/create", createStudent);
router.post("/verify", getStudent);

export default router;
