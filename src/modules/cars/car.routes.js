
import { Router } from "express";

import { addCar, getAllCars } from "./car.controller.js";
import {
  verifyToken,
  verifyOwner,
} from "../../middleware/auth.middleware.js";

const router = Router();

// Get all approved and active cars
router.get("/", getAllCars);

// Add a new car (Owner only)
router.post("/", verifyToken, verifyOwner, addCar);


export default router;
