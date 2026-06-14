import express from "express";
import {
  adminLogin,
  verifyAdminOtp,
  adminLogout,
} from "#src/controllers/admin/admin.auth.controller.js";

const authAdminRouter = express.Router();

// Login with email & password
authAdminRouter.post("/login", adminLogin);

// Verify OTP
authAdminRouter.post("/verify-otp", verifyAdminOtp);

// Logout
authAdminRouter.post("/logout", adminLogout);

export default authAdminRouter;
