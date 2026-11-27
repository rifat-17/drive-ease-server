
import { Router } from "express";

import { addCar } from "./car.controller.js";
import {
  verifyToken,
  verifyOwner,
} from "../../middleware/auth.middleware.js";

const router = Router();

// Add a new car (Owner only)
router.post("/", verifyToken, verifyOwner, addCar);

export default router;
