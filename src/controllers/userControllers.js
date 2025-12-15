import User from "../models/user.js";
import uploadToR2 from "../utils/uploadToR2.js";

export const updateProfile = async (req, res) => {
  try {
    console.log("req body in update profile ", req.body);

    const { name, phone, gender, dob } = req.body;

    const address = req.body.address ? JSON.parse(req.body.address) : {};

    const updateData = {
      name,
      phone,
      gender,
      dob,
      address,
    };

    // If image uploaded
    if (req.file) {
      const imageUrl = await uploadToR2(req.file);
      updateData.image = imageUrl; // later replace with R2 URL
    }

    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getProfile = async(req, res) => {
  try {
    console.log("This is user id in get profile",req.userId);
    const user = await User.findById(req.userId).select(
      "name email phone gender dob address image"
    );

    if(!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}
