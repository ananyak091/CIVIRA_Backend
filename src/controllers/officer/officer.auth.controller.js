import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Officer from "#src/models/officer/officer.model.js";

/**
 * @desc Officer Login
 * @route POST /api/officer/auth/login
 */
export const officerLogin = async (req, res) => {
  try {
    const { officerId, password } = req.body;

    if (!officerId || !password) {
      return res.status(400).json({
        success: false,
        message: "Officer ID and Password are required",
      });
    }

    const officer = await Officer.findOne({ officerId });

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found",
      });
    }
    console.log("password from clien officer :", officer);
    console.log("password saved in db", officer.password);
    const isMatch = await bcrypt.compare(password, officer.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: officer._id,
        officerId: officer.officerId,
        role: "officer",
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
      officer: {
        id: officer._id,
        officerId: officer.officerId,
        state: officer.state,
        city: officer.city,
        wardNo: officer.wardNo,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
