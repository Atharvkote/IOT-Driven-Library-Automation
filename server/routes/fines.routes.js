import { Router } from "express";
import { calculateFines } from "../controller/fines.controller";


const router = Router();

router.get("/" , calculateFines);

export default router;
