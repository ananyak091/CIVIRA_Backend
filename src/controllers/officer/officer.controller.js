import { Complaint } from "#src/models/complaints.model.js";
import uploadToR2 from "#src/utils/uploadToR2.js";
import Evidence from "#src/models/evidence.model.js";
import Notification from "#src/models/notifactions.model.js";

export const getAssignedComplaints = async (req, res) => {
  try {
    console.log("in officer");
    const complaints = await Complaint.find({
      assignedOfficer: req.officerId,
    })
      .populate("userId", "name email")
      .populate("evidenceIds")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id)
      .populate("userId", "name email phone")
      .populate("evidenceIds");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    // Ensure the complaint belongs to the logged-in officer
    if (complaint.assignedOfficer.toString() !== req.officerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    return res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Accept Complaint

export const acceptComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    if (complaint.assignedOfficer.toString() !== req.officerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    if (complaint.complaint_status !== "Registered") {
      return res.status(400).json({
        success: false,
        message: "Complaint has already been accepted.",
      });
    }

    complaint.complaint_status = "In Progress";

    await complaint.save();
    await Notification.create({
      userId: complaint.userId,
      complaintId: complaint._id,
      title: "Complaint Accepted",
      message: "Your complaint has been accepted and is now In Progress.",
    });

    return res.status(200).json({
      success: true,
      message: "Complaint accepted successfully.",
      complaint,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Reject Complaint

export const rejectComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    if (complaint.assignedOfficer.toString() !== req.officerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    if (complaint.complaint_status !== "Registered") {
      return res.status(400).json({
        success: false,
        message: "Complaint cannot be rejected now.",
      });
    }

    complaint.complaint_status = "Rejected";
    complaint.additionalNotes = remarks || "";

    await complaint.save();

    await Notification.create({
      userId: complaint.userId,
      complaintId: complaint._id,
      title: "Complaint Rejected",
      message: `Your complaint has been rejected. Reason: ${remarks}`,
    });

    return res.status(200).json({
      success: true,
      message: "Complaint rejected successfully.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Resolve Complaints

export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    // Check if complaint belongs to logged-in officer
    if (complaint.assignedOfficer.toString() !== req.officerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    // Complaint must be accepted first
    if (complaint.complaint_status !== "In Progress") {
      return res.status(400).json({
        success: false,
        message: "Complaint is not in progress.",
      });
    }

    // At least one proof image is required
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one resolution image.",
      });
    }

    const evidenceIds = [];

    // Upload each image to Cloudflare R2
    for (const file of req.files) {
      const imageUrl = await uploadToR2(file, "officer-evidence");

      const evidence = await Evidence.create({
        complaintId: complaint._id,
        image_url: imageUrl,
        type: "officer",
      });

      evidenceIds.push(evidence._id);
    }

    // Attach officer evidence to complaint
    complaint.evidenceIds.push(...evidenceIds);

    // Save remarks if provided
    if (remarks) {
      complaint.additionalNotes = remarks;
    }

    // Update complaint status
    complaint.complaint_status = "Resolved";

    await complaint.save();

    await Notification.create({
      userId: complaint.userId,
      complaintId: complaint._id,
      title: "Complaint Resolved",
      message:
        "Your complaint has been resolved. Please review the resolution images.",
    });

    return res.status(200).json({
      success: true,
      message: "Complaint resolved successfully.",
      complaint,
    });
  } catch (error) {
    console.error("Resolve Complaint Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
