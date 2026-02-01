import express from "express";
import {
  getProfile,
  updateProfile,
  registerComplaintByCitizen,
  getMycomplaints,
  getComplaintDetails,
} from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const userRouter = express.Router();
// get api -> get-profile
userRouter.get("/get-profile", authMiddleware, getProfile);

// update profile
userRouter.post(
  "/update-profile",
  authMiddleware,
  upload.single("image"),
  updateProfile,
);

// register complaint by user , this will call while submitting the complaint !!
userRouter.post(
  "/register-complaint",
  authMiddleware,
  (req, res, next) => {
    console.log("✅ After auth, before multer");
    next();

  },
  upload.array("images", 3),
  (req, res, next) => {
    console.log("✅ After upload array, before register complaint");
    next();

  },
  registerComplaintByCitizen
);

// get my complaint - user
userRouter.get("/my-complaints", authMiddleware, getMycomplaints);

//get my complaint details
userRouter.get("/my-complaints/:id", authMiddleware, getComplaintDetails);

export default userRouter;
