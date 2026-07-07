import jwt from "jsonwebtoken";
import AdminOtp from "#src/models/admin/adminOTP.model.js";
import sendAdminOtp from "#src/utils/sendAdminOtp.js";

/**
 * @desc Admin Login
 * @route POST /api/admin/auth/login
 */
export const adminLogin = async (req, res) => {
  try {
    // console.log("inside admin login");

    const { email, password } = req.body;
    // console.log(" admin email", email, password);
    // console.log("admin_email", process.env.ADMIN_EMAIL, process.env.ADMIN_PASS);

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASS
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid Admin Credentials",
      });
    }

    //
    // Generate OTP
    // Save OTP
    // Send OTP to Admin Email TODO:

    const otp = Math.floor(100000 + Math.random() * 900000);
    await AdminOtp.findOneAndUpdate(
      { email },
      {
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      { upsert: true },
    );

    console.log("Generated OTP:", otp);

    await sendAdminOtp(email, otp);
    console.log("email and password verified");

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc Verify Admin OTP
 * @route POST /api/admin/auth/verify-otp
 */

export const verifyAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if OTP exists
    const otpDoc = await AdminOtp.findOne({ email });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please login again.",
      });
    }

    // Check if OTP has expired
    if (otpDoc.expiresAt < new Date()) {
      await AdminOtp.deleteOne({ email });

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please login again.",
      });
    }

    // Check if OTP matches
    if (otpDoc.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // OTP verified, remove it
    await AdminOtp.deleteOne({ email });

    // Generate JWT
    const token = jwt.sign(
      {
        role: "admin",
        email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc Admin Logout
 * @route POST /api/admin/auth/logout
 */
export const adminLogout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged Out Successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
