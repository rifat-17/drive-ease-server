
import { Router } from "express";

import { addCar, deleteCar, getAllCars, getCarById, getMyCars, updateCar, toggleCarAvailability, } from "./car.controller.js";
import {
  verifyToken,
  verifyOwner,
} from "../../middleware/auth.middleware.js";

const router = Router();

// Get all approved and active cars
router.get("/", getAllCars);

// Get cars belonging to the logged-in owner
router.get("/my-cars", verifyToken, verifyOwner, getMyCars);



// Get a single car by ID
router.get("/:id", getCarById);

// Add a new car (Owner only)
router.post("/", verifyToken, verifyOwner, addCar);


// Update a car (Owner only)
router.put("/:id", verifyToken, verifyOwner, updateCar);


router.patch(
  "/:id/availability",
  verifyToken,
  verifyOwner,
  toggleCarAvailability
);


// Delete a car (Owner only)
router.delete("/:id", verifyToken, verifyOwner, deleteCar);

export default router;
