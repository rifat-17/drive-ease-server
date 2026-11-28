import express from "express";

import {
  verifyOwner,
  verifyToken,
} from "../../middleware/auth.middleware.js";

import { getOwnerOverview } from "./owner.controller.js";

const router = express.Router();

router.get("/overview", verifyToken, verifyOwner, getOwnerOverview);

export default router;