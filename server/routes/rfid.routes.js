import { Router } from "express";
import {
  getLatestScan,
  isRfidActive,
  rfidScan,
} from "../controller/rfid.controller.js";

const router = Router();

// RFID scan endpoint
router.post("/scan", rfidScan);
router.get("/get-scanned", getLatestScan);

router.post("/is-active", isRfidActive);

export default router;
