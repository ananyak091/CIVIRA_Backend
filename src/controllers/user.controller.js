import User from "../models/user.model.js";
import uploadToR2 from "../utils/uploadToR2.js";
import { Complaint } from "../models/complaints.model.js";
import Evidence from "../models/evidence.model.js";

// update profile logic
export const updateProfile = async (req, res) => {
  try {
    console.log("req body in update profile ", req.body);

    const { name, phone, gender, dob, removeImage, image } = req.body;
    console.log("req.body in update", req.body);

    const address = req.body.address ? JSON.parse(req.body.address) : {};

    const updateData = {
      name,
      phone,
      gender,
      address,
    };
    // dob check
    if (dob) {
      const dob = new Date(req.body.dob);
      const today = new Date();

      if (dob > today) {
        return res.status(400).json({
          message: "Date of birth cannot be in the future",
        });
      }

      updateData.dob = dob;
    }

    // If image uploaded
    if (req.file) {
      console.log("inside update req file", req.file);
      // we will not req.file if there is no upload
      const imageUrl = await uploadToR2(req.file);
      updateData.image = imageUrl; // later replace with R2 URL
    }
    console.log("remove image is ", removeImage);
    // ✅ Remove image
    if (removeImage === "true") {
      updateData.image = "";
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

    return setTimeout(() => {
      res.json({
        success: true,
        message: "Profile updated successfully",
        user,
      });
    }, 3000);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// get profile logic
export const getProfile = async (req, res) => {
  try {
    // console.log("This is user id in get profile",req.userId);
    const user = await User.findById(req.userId).select(
      "name email phone gender dob address image",
    );
    console.log("user in get profile : ", user);

    if (!user.image) {
      user.image =
        "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg";
    }

    if (!user) {
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
    });
  }
};

// register Complaint By Citizen logic

export const registerComplaintByCitizen = async (req, res, next) => {
  try {
    console.log("in register complaint");
    // console.log("request is", req.body);
    const complaintBody = JSON.parse(req.body.data);
    const metaData = JSON.parse(req.body.meta || "[]");

    // 1️⃣ Create Complaint
    const newComplaint = await Complaint.create({
      userId: req.userId,
      ward: complaintBody.ward,
      landmark: complaintBody.landmark,
      address: complaintBody.address,
      category: complaintBody.category,
      description: complaintBody.description,
      additionalNotes: complaintBody.notes,
    });
    // STEP 2: Upload images & create Evidence docs
    let evidenceIds = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const meta = metaData[i] || {};

        const imageUrl = await uploadToR2(file.buffer);

        const evidence = await Evidence.create({
          complaintId: newComplaint._id,
          image_url: imageUrl,
          type: "citizen",
          // lat: meta.lat,
          // lng: meta.lng,
          // accuracy: meta.accuracy,
          // timestamp: meta.timestamp,
          // isoTime: meta.isoTime,
        });

        evidenceIds.push(evidence._id);
      }
    }

    if (!req.userId) {
      // if there is no user then please reject request
      res.status(300).json({
        success: false,
        message: "User Not Found",
      });
    }

    // STEP 3: Update complaint with evidenceIds
    newComplaint.evidenceIds = evidenceIds;
    await newComplaint.save();

    // STEP 4: Response
    return res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      newComplaint,
    });
  } catch (error) {
    console.error("register Complaint error:", error);
    res.status(500).json({
      success: false,
      error: error,
      message: "Server error",
    });
  }
};

// get all user complaints logic goes here
export const getMycomplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ userId: req.userId })
  .select("category ward landmark address complaint_status additionalNotes assigned_department createdAt")
  .sort({ createdAt: -1 });

  if (!complaints) {
      return res.status(404).json({
        success: false,
        message: "You have not registered",
      });
    }

    res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("get my Complaint error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getComplaintDetails = async (req, res, next) => {
  try {
    const complaintId = req.params.id; // or req.body.id based on your route

    // 1️⃣ Fetch complaint details
    const complaint_details = await Complaint.findById(complaintId)
      .select("category ward landmark address complaint_status createdAt");

    if (!complaint_details) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // 2️⃣ Fetch all evidence linked to this complaint
    const evidence_details = await Evidence.find({ complaintId })
      .select("image_url uploaded_at type");

    return res.status(200).json({
      success: true,
      complaint: complaint_details,
      evidence: evidence_details,
    });
    
  } catch (error) {
    console.error("get my Complaint error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}