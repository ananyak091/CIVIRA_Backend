import Officer from "#src/models/officer/officer.model.js";
import bcrypt from "bcryptjs";
import { Complaint } from "#src/models/complaints.model.js";
import AdminNotification from "#src/models/admin/adminNotification.model.js";

/**
 * @desc Dashboard Analytics
 * @route GET /api/admin/dashboard
 */

// export const getUnreadNotificationCount = async (req, res) => {
//   try {
//     const unreadCount = await AdminNotification.countDocuments({
//       status: "Pending",
//     });

//     return res.status(200).json({
//       success: true,
//       unreadCount,
//     });
//   } catch (error) {
//     console.log(error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };
export const getDashboard = async (req, res) => {
  try {
    const [
      totalOfficers,
      activeOfficers,
      suspendedOfficers,

      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      waitingForOfficerComplaints,
    ] = await Promise.all([
      Officer.countDocuments(),

      Officer.countDocuments({
        status: "Active",
      }),

      Officer.countDocuments({
        status: "Suspended",
      }),

      Complaint.countDocuments(),

      Complaint.countDocuments({
        complaint_status: "Pending",
      }),

      Complaint.countDocuments({
        complaint_status: "In Progress",
      }),

      Complaint.countDocuments({
        complaint_status: "Resolved",
      }),

      Complaint.countDocuments({
        complaint_status: "Waiting for Officer",
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Dashboard Data",
      data: {
        officers: {
          total: totalOfficers,
          active: activeOfficers,
          suspended: suspendedOfficers,
        },

        complaints: {
          total: totalComplaints,
          pending: pendingComplaints,
          inProgress: inProgressComplaints,
          resolved: resolvedComplaints,
          waitingForOfficer: waitingForOfficerComplaints,
        },
      },
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
 * @desc Check Ward Availability
 * @route GET /api/admin/check-ward
 */
export const checkWardAvailability = async (req, res) => {
  try {
    const { state, city, wardNo } = req.query;

    if (!state || !city || !wardNo) {
      return res.status(400).json({
        success: false,
        message: "State, City and Ward Number are required.",
      });
    }

    // Only active officers block a ward
    const officer = await Officer.findOne({
      state,
      city,
      wardNo,
      status: "Active",
    });

    if (officer) {
      return res.status(200).json({
        success: true,
        available: false,
        message: "An active officer is already assigned to this ward.",
      });
    }

    return res.status(200).json({
      success: true,
      available: true,
      message: "Ward is available.",
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
 * @desc Create Officer
 * @route POST /api/admin/create-officer
 */
export const createOfficer = async (req, res) => {
  try {
    const { wardNo, city, state } = req.body;

    if (!wardNo || !city || !state) {
      return res.status(400).json({
        success: false,
        message: "State, City and Ward Number are required.",
      });
    }

    // Check if an ACTIVE officer already exists
    const existingOfficer = await Officer.findOne({
      state,
      city,
      wardNo,
      status: "Active",
    });

    if (existingOfficer) {
      return res.status(400).json({
        success: false,
        message: "An active officer is already assigned to this ward.",
      });
    }

    // Generate Officer ID
    const officerId = `OFF-${state
      .substring(0, 2)
      .toUpperCase()}-${city.substring(0, 3).toUpperCase()}-${wardNo}`;

    // Generate Temporary Password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Hash Password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create Officer
    const officer = await Officer.create({
      officerId,
      password: hashedPassword,
      intialPassword: tempPassword,
      wardNo,
      city,
      state,
      status: "Active",
    });

    // -----------------------------
    // TODO (Recommended for CIVIRA)
    // Automatically assign all
    // waiting complaints of this
    // ward to this officer.
    // -----------------------------

    return res.status(201).json({
      success: true,
      message: "Officer Created Successfully",
      officerId,
      password: tempPassword,
      officer,
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
 * @desc Get All Officers
 * @route GET /api/admin/officers
 */
export const getAllOfficers = async (req, res) => {
  try {
    const officers = await Officer.find()
      .sort({ createdAt: -1 })
      .select(
        "officerId intialPassword wardNo city state status createdAt updatedAt",
      );

    return res.status(200).json({
      success: true,
      officers,
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
 * @desc Update Officer
 * @route PUT /api/admin/officers/:id
 */
export const updateOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const { state, city, wardNo } = req.body;

    const officer = await Officer.findById(id);

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found.",
      });
    }

    // Prevent duplicate ACTIVE officer
    const duplicateOfficer = await Officer.findOne({
      _id: { $ne: id },
      state,
      city,
      wardNo,
      status: "Active",
    });

    if (duplicateOfficer) {
      return res.status(400).json({
        success: false,
        message: "Another active officer already exists for this ward.",
      });
    }

    officer.state = state;
    officer.city = city;
    officer.wardNo = wardNo;

    await officer.save();

    return res.status(200).json({
      success: true,
      message: "Officer updated successfully.",
      officer,
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
 * @desc Suspend / Activate Officer
 * @route PATCH /api/admin/officers/:id/status
 */
export const toggleOfficerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const officer = await Officer.findById(id);

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found.",
      });
    }

    officer.status = officer.status === "Active" ? "Suspended" : "Active";

    await officer.save();

    return res.status(200).json({
      success: true,
      message: `Officer ${
        officer.status === "Active" ? "activated" : "suspended"
      } successfully.`,
      officer,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
