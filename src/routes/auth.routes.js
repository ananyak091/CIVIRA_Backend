import express from "express";
import {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  resetPassword,
  continueWithGoogle,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/google", continueWithGoogle);
authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
