import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// REGISTER
export const registerUser = async (req, res) => {
  try {
    console.log(req.body);

    const { name, email, password } = req.body;
    console.log(name, email, password);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashPassword", hashedPassword);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    console.log("user", user);
    res.status(201).json({
      message: "User registered successfully",
      user: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    console.log("Login body:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "21d",
    });

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateOtp = () => {
  const buffer = crypto.randomBytes(3);
  const otpNum = buffer.readUIntBE(0, 3) % 1000000;
  return otpNum.toString().padStart(6, "0");
};

// SEND OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const code = generateOtp(); // e.g., 6-digit OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = {
      code,
      expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
      verifiedAt: null,
    };

    await user.save();

    // 🔥 Send Email Here
    await sendEmail(
      email,
      "Your Civira Password Reset OTP",
      `
        <h2>Your OTP Code</h2>
        <p>Your OTP for password reset is:</p>
        <h1 style="letter-spacing: 5px;">${code}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request a reset, please ignore this email.</p>
      `,
    );

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otp.code) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (user.otp.expiresAt && user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otp.code !== otp) {
      user.otp.attempts = (user.otp.attempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.otp.verifiedAt = new Date();
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otp.code) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (user.otp.expiresAt && user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otp.code !== otp) {
      user.otp.attempts = (user.otp.attempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = {
      code: null,
      expiresAt: null,
      attempts: 0,
      lastSentAt: null,
      verifiedAt: new Date(),
    };

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CONTINUE WITH GOOGLE (SIGNUP / SIGNIN)
export const continueWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res
        .status(500)
        .json({ message: "Google client ID not configured" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || "Google User";
    const image = payload.picture || null;
    const emailVerified = Boolean(payload.email_verified);

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        name,
        email,
        image,
        googleId,
        authProvider: "google",
        isEmailVerified: emailVerified,
        password: null,
      });
    } else {
      let shouldSave = false;

      if (!user.googleId) {
        user.googleId = googleId;
        shouldSave = true;
      }

      if (user.authProvider !== "google") {
        user.authProvider = "google";
        shouldSave = true;
      }

      if (!user.image && image) {
        user.image = image;
        shouldSave = true;
      }

      if (!user.isEmailVerified && emailVerified) {
        user.isEmailVerified = true;
        shouldSave = true;
      }

      if (shouldSave) {
        await user.save();
      }
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "21d",
    });

    res.status(200).json({
      message: "Google auth successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Google auth failed" });
  }
};
