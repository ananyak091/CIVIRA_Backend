import express from "express";
import { updateProfile } from "../controllers/userControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();
// get api -> get-profile
router.post(
  "/update-profile",
  authMiddleware,
  upload.single("image"),
  updateProfile
);

export default router;
